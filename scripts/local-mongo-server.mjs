import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import { BSON, ObjectId, Long } from 'bson'
import mingo from 'mingo'

const DATA_FILE = path.resolve(process.cwd(), '.data', 'mongo-store.json')

function serializeBsonTypes(val) {
  if (val === null || val === undefined) return val
  if (val instanceof ObjectId || val?._bsontype === 'ObjectId') {
    return { $oid: val.toString() }
  }
  if (val instanceof Date) {
    return { $date: val.toISOString() }
  }
  if (Array.isArray(val)) {
    return val.map(serializeBsonTypes)
  }
  if (typeof val === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(val)) {
      out[k] = serializeBsonTypes(v)
    }
    return out
  }
  return val
}

function deserializeBsonTypes(val) {
  if (val === null || val === undefined) return val
  if (Array.isArray(val)) {
    return val.map(deserializeBsonTypes)
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val)
    if (keys.length === 1 && keys[0] === '$oid' && typeof val.$oid === 'string') {
      return new ObjectId(val.$oid)
    }
    if (keys.length === 1 && keys[0] === '$date' && typeof val.$date === 'string') {
      return new Date(val.$date)
    }
    const out = {}
    for (const [k, v] of Object.entries(val)) {
      out[k] = deserializeBsonTypes(v)
    }
    return out
  }
  return val
}

function cloneDoc(doc) {
  return deserializeBsonTypes(serializeBsonTypes(doc))
}

function normalizeForMingo(val) {
  if (val === null || val === undefined) return val
  if (val instanceof ObjectId || val?._bsontype === 'ObjectId') {
    return val.toString()
  }
  if (val?._bsontype === 'BSONRegExp') {
    return new RegExp(val.pattern, val.options)
  }
  if (val instanceof Date || val instanceof RegExp) {
    return val
  }
  if (Array.isArray(val)) {
    return val.map(normalizeForMingo)
  }
  if (typeof val === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(val)) {
      out[k] = normalizeForMingo(v)
    }
    return out
  }
  return val
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== 'object') {
      cur[p] = {}
    }
    cur = cur[p]
  }
  cur[parts[parts.length - 1]] = value
}

function unsetByPath(obj, pathStr) {
  const parts = pathStr.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== 'object') {
      return
    }
    cur = cur[p]
  }
  delete cur[parts[parts.length - 1]]
}

function getByPath(obj, pathStr) {
  const parts = pathStr.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined
    cur = cur[p]
  }
  return cur
}

function applyUpdate(doc, updateSpec) {
  const target = cloneDoc(doc)
  const keys = Object.keys(updateSpec || {})
  const hasOperators = keys.some((k) => k.startsWith('$'))

  if (!hasOperators) {
    const id = target._id
    const replaced = cloneDoc(updateSpec)
    if (id !== undefined && replaced._id === undefined) {
      replaced._id = id
    }
    return replaced
  }

  if (updateSpec.$set) {
    for (const [k, v] of Object.entries(updateSpec.$set)) {
      if (k === '_id') continue
      setByPath(target, k, cloneDoc(v))
    }
  }
  if (updateSpec.$unset) {
    for (const k of Object.keys(updateSpec.$unset)) {
      unsetByPath(target, k)
    }
  }
  if (updateSpec.$inc) {
    for (const [k, v] of Object.entries(updateSpec.$inc)) {
      const current = Number(getByPath(target, k) || 0)
      setByPath(target, k, current + Number(v))
    }
  }
  if (updateSpec.$push) {
    for (const [k, v] of Object.entries(updateSpec.$push)) {
      const arr = Array.isArray(getByPath(target, k)) ? [...getByPath(target, k)] : []
      if (v && typeof v === 'object' && Array.isArray(v.$each)) {
        arr.push(...v.$each.map(cloneDoc))
      } else {
        arr.push(cloneDoc(v))
      }
      setByPath(target, k, arr)
    }
  }
  if (updateSpec.$addToSet) {
    for (const [k, v] of Object.entries(updateSpec.$addToSet)) {
      const arr = Array.isArray(getByPath(target, k)) ? [...getByPath(target, k)] : []
      const items = v && typeof v === 'object' && Array.isArray(v.$each) ? v.$each : [v]
      for (const item of items) {
        const s = JSON.stringify(normalizeForMingo(item))
        if (!arr.some((existing) => JSON.stringify(normalizeForMingo(existing)) === s)) {
          arr.push(cloneDoc(item))
        }
      }
      setByPath(target, k, arr)
    }
  }
  if (updateSpec.$pull) {
    for (const [k, v] of Object.entries(updateSpec.$pull)) {
      const arr = Array.isArray(getByPath(target, k)) ? [...getByPath(target, k)] : []
      if (v && typeof v === 'object' && Array.isArray(v.$in)) {
        const inSet = new Set(v.$in.map((x) => JSON.stringify(normalizeForMingo(x))))
        setByPath(
          target,
          k,
          arr.filter((x) => !inSet.has(JSON.stringify(normalizeForMingo(x)))),
        )
      } else {
        const targetStr = JSON.stringify(normalizeForMingo(v))
        setByPath(
          target,
          k,
          arr.filter((x) => JSON.stringify(normalizeForMingo(x)) !== targetStr),
        )
      }
    }
  }

  return target
}

class LocalMongoStore {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath
    this.dbs = {}
    this.load()
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
        this.dbs = deserializeBsonTypes(raw) || {}
      }
    } catch (err) {
      console.error('[LocalMongo] Failed to load store, starting fresh:', err.message)
      this.dbs = {}
    }
  }

  saveSync() {
    try {
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const serialized = JSON.stringify(serializeBsonTypes(this.dbs))
      const tmpFile = `${this.filePath}.${process.pid}.tmp`
      fs.writeFileSync(tmpFile, serialized, 'utf8')
      fs.renameSync(tmpFile, this.filePath)
    } catch (err) {
      console.error('[LocalMongo] Save error:', err.message)
    }
  }

  scheduleSave() {
    this.saveSync()
  }

  getCollection(dbName, collName) {
    if (!this.dbs[dbName]) this.dbs[dbName] = {}
    if (!this.dbs[dbName][collName]) this.dbs[dbName][collName] = []
    return this.dbs[dbName][collName]
  }

  setCollection(dbName, collName, docs) {
    if (!this.dbs[dbName]) this.dbs[dbName] = {}
    this.dbs[dbName][collName] = docs
  }

  findMatchingIndices(docs, filter = {}, sortSpec = null) {
    const normFilter = normalizeForMingo(filter || {})
    const indexed = docs.map((doc, idx) => ({
      __idx: idx,
      ...normalizeForMingo(doc),
    }))
    let cursor = mingo.find(indexed, normFilter)
    if (sortSpec && Object.keys(sortSpec).length > 0) {
      cursor = cursor.sort(sortSpec)
    }
    return cursor.all().map((item) => item.__idx)
  }
}

function parseOpMsg(buffer) {
  const flagBits = buffer.readUInt32LE(16)
  const hasChecksum = (flagBits & 1) !== 0
  const endOffset = hasChecksum ? buffer.length - 4 : buffer.length
  let offset = 20
  let body = {}
  const sequences = {}

  while (offset < endOffset) {
    const kind = buffer.readUInt8(offset)
    offset += 1
    if (kind === 0) {
      const docSize = buffer.readInt32LE(offset)
      const docBuf = buffer.subarray(offset, offset + docSize)
      body = BSON.deserialize(docBuf)
      offset += docSize
    } else if (kind === 1) {
      const sectionSize = buffer.readInt32LE(offset)
      const sectionEnd = offset + sectionSize
      offset += 4
      let strEnd = offset
      while (strEnd < sectionEnd && buffer[strEnd] !== 0) strEnd++
      const identifier = buffer.subarray(offset, strEnd).toString('utf8')
      offset = strEnd + 1
      const docs = []
      while (offset < sectionEnd) {
        const docSize = buffer.readInt32LE(offset)
        const docBuf = buffer.subarray(offset, offset + docSize)
        docs.push(BSON.deserialize(docBuf))
        offset += docSize
      }
      sequences[identifier] = docs
    } else {
      break
    }
  }

  for (const [k, v] of Object.entries(sequences)) {
    body[k] = v
  }
  return body
}

function buildOpMsgResponse(requestID, responseDoc) {
  const bsonBytes = BSON.serialize(responseDoc)
  const totalLength = 16 + 4 + 1 + bsonBytes.length
  const buf = Buffer.allocUnsafe(totalLength)
  buf.writeInt32LE(totalLength, 0)
  buf.writeInt32LE(requestID + 1, 4)
  buf.writeInt32LE(requestID, 8)
  buf.writeInt32LE(2013, 12)
  buf.writeUInt32LE(0, 16)
  buf.writeUInt8(0, 20)
  Buffer.from(bsonBytes).copy(buf, 21)
  return buf
}

function buildOpReplyResponse(requestID, responseDoc) {
  const bsonBytes = BSON.serialize(responseDoc)
  const totalLength = 16 + 20 + bsonBytes.length
  const buf = Buffer.allocUnsafe(totalLength)
  buf.writeInt32LE(totalLength, 0)
  buf.writeInt32LE(requestID + 1, 4)
  buf.writeInt32LE(requestID, 8)
  buf.writeInt32LE(1, 12)
  buf.writeInt32LE(0, 16)
  buf.writeBigInt64LE(0n, 20)
  buf.writeInt32LE(0, 28)
  buf.writeInt32LE(1, 32)
  Buffer.from(bsonBytes).copy(buf, 36)
  return buf
}

function executeCommand(store, cmd) {
  const dbName = cmd.$db || 'celeste-voyages'
  const cmdKeys = Object.keys(cmd)
  const action = cmdKeys[0]

  if (
    action === 'ismaster' ||
    action === 'isMaster' ||
    action === 'hello' ||
    cmd.ismaster ||
    cmd.isMaster ||
    cmd.hello
  ) {
    return {
      ismaster: true,
      isWritablePrimary: true,
      maxBsonObjectSize: 16777216,
      maxMessageSizeBytes: 48000000,
      maxWriteBatchSize: 100000,
      localTime: new Date(),
      logicalSessionTimeoutMinutes: 30,
      connectionId: 1,
      minWireVersion: 0,
      maxWireVersion: 17,
      readOnly: false,
      ok: 1,
    }
  }

  if (action === 'ping' || cmd.ping) {
    return { ok: 1 }
  }

  if (action === 'buildInfo' || action === 'buildinfo') {
    return {
      version: '7.0.14',
      versionArray: [7, 0, 14, 0],
      bits: 64,
      maxBsonObjectSize: 16777216,
      ok: 1,
    }
  }

  if (
    action === 'endSessions' ||
    action === 'startSession' ||
    action === 'abortTransaction' ||
    action === 'commitTransaction' ||
    action === 'getParameter' ||
    action === 'createIndexes' ||
    action === 'dropIndexes' ||
    action === 'create'
  ) {
    return { ok: 1 }
  }

  if (action === 'drop') {
    const collName = cmd.drop
    if (store.dbs[dbName]) {
      delete store.dbs[dbName][collName]
      store.scheduleSave()
    }
    return { ok: 1 }
  }

  if (action === 'dropDatabase') {
    delete store.dbs[dbName]
    store.scheduleSave()
    return { dropped: dbName, ok: 1 }
  }

  if (action === 'listCollections') {
    const colls = Object.keys(store.dbs[dbName] || {}).map((name) => ({
      name,
      type: 'collection',
      options: {},
      info: { readOnly: false },
    }))
    return {
      cursor: {
        id: Long.fromNumber(0),
        ns: `${dbName}.$cmd.listCollections`,
        firstBatch: colls,
      },
      ok: 1,
    }
  }

  if (action === 'insert') {
    const collName = cmd.insert
    const docsToInsert = cmd.documents || []
    const coll = store.getCollection(dbName, collName)
    let inserted = 0
    for (const rawDoc of docsToInsert) {
      const doc = cloneDoc(rawDoc)
      if (doc._id === undefined) {
        doc._id = new ObjectId()
      }
      coll.push(doc)
      inserted++
    }
    store.scheduleSave()
    return { n: inserted, ok: 1 }
  }

  if (action === 'find') {
    const collName = cmd.find
    const coll = store.getCollection(dbName, collName)
    const indices = store.findMatchingIndices(coll, cmd.filter || {}, cmd.sort || null)
    let matched = indices.map((i) => cloneDoc(coll[i]))
    if (typeof cmd.skip === 'number' && cmd.skip > 0) {
      matched = matched.slice(cmd.skip)
    }
    if (typeof cmd.limit === 'number' && cmd.limit > 0) {
      matched = matched.slice(0, cmd.limit)
    }
    return {
      cursor: {
        id: Long.fromNumber(0),
        ns: `${dbName}.${collName}`,
        firstBatch: matched,
      },
      ok: 1,
    }
  }

  if (action === 'count') {
    const collName = cmd.count
    const coll = store.getCollection(dbName, collName)
    const indices = store.findMatchingIndices(coll, cmd.query || {})
    let n = indices.length
    if (typeof cmd.skip === 'number' && cmd.skip > 0) {
      n = Math.max(0, n - cmd.skip)
    }
    if (typeof cmd.limit === 'number' && cmd.limit > 0) {
      n = Math.min(n, cmd.limit)
    }
    return { n, ok: 1 }
  }

  if (action === 'distinct') {
    const collName = cmd.distinct
    const key = cmd.key
    const coll = store.getCollection(dbName, collName)
    const indices = store.findMatchingIndices(coll, cmd.query || {})
    const seen = new Set()
    const values = []
    for (const i of indices) {
      const val = getByPath(coll[i], key)
      const items = Array.isArray(val) ? val : [val]
      for (const item of items) {
        if (item !== undefined) {
          const s = JSON.stringify(normalizeForMingo(item))
          if (!seen.has(s)) {
            seen.add(s)
            values.push(item)
          }
        }
      }
    }
    return { values, ok: 1 }
  }

  if (action === 'aggregate') {
    const collName = cmd.aggregate
    const coll = store.getCollection(dbName, collName)
    const pipeline = cmd.pipeline || []

    const idMap = new Map()
    const normDocs = coll.map((d) => {
      const nd = normalizeForMingo(d)
      if (nd && nd._id !== undefined) {
        idMap.set(String(nd._id), d)
      }
      return nd
    })

    const resolvedPipeline = pipeline.map((stage) => {
      const normStage = normalizeForMingo(stage)
      if (normStage.$lookup && typeof normStage.$lookup.from === 'string') {
        const fromColl = store
          .getCollection(dbName, normStage.$lookup.from)
          .map(normalizeForMingo)
        return {
          $lookup: {
            ...normStage.$lookup,
            from: fromColl,
          },
        }
      }
      return normStage
    })

    const aggResults = mingo.aggregate(normDocs, resolvedPipeline)

    const finalResults = aggResults.map((res) => {
      if (res && res._id && idMap.has(String(res._id))) {
        const orig = cloneDoc(idMap.get(String(res._id)))
        return { ...orig, ...res, _id: orig._id }
      }
      return res
    })

    return {
      cursor: {
        id: Long.fromNumber(0),
        ns: `${dbName}.${collName}`,
        firstBatch: finalResults,
      },
      ok: 1,
    }
  }

  if (action === 'update') {
    const collName = cmd.update
    const updates = cmd.updates || []
    const coll = store.getCollection(dbName, collName)
    let nMatched = 0
    let nModified = 0
    const upserted = []

    updates.forEach((uSpec, idx) => {
      const indices = store.findMatchingIndices(coll, uSpec.q || {})
      if (indices.length === 0) {
        if (uSpec.upsert) {
          const base = {}
          for (const [k, v] of Object.entries(uSpec.q || {})) {
            if (!k.startsWith('$') && (typeof v !== 'object' || v === null || v instanceof ObjectId || v instanceof Date)) {
              setByPath(base, k, cloneDoc(v))
            }
          }
          if (uSpec.u && uSpec.u.$setOnInsert) {
            for (const [k, v] of Object.entries(uSpec.u.$setOnInsert)) {
              setByPath(base, k, cloneDoc(v))
            }
          }
          const newDoc = applyUpdate(base, uSpec.u || {})
          if (newDoc._id === undefined) {
            newDoc._id = new ObjectId()
          }
          coll.push(newDoc)
          upserted.push({ index: idx, _id: newDoc._id })
          nMatched++
        }
      } else {
        const targets = uSpec.multi ? indices : [indices[0]]
        for (const docIdx of targets) {
          coll[docIdx] = applyUpdate(coll[docIdx], uSpec.u || {})
          nMatched++
          nModified++
        }
      }
    })

    store.scheduleSave()
    const res = { n: nMatched, nModified, ok: 1 }
    if (upserted.length > 0) res.upserted = upserted
    return res
  }

  if (action === 'findAndModify' || action === 'findandmodify') {
    const collName = cmd.findAndModify || cmd.findandmodify
    const coll = store.getCollection(dbName, collName)
    const indices = store.findMatchingIndices(coll, cmd.query || {}, cmd.sort || null)

    if (indices.length === 0) {
      if (cmd.upsert && !cmd.remove) {
        const base = {}
        for (const [k, v] of Object.entries(cmd.query || {})) {
          if (!k.startsWith('$') && (typeof v !== 'object' || v === null || v instanceof ObjectId || v instanceof Date)) {
            setByPath(base, k, cloneDoc(v))
          } else if (!k.startsWith('$') && v && typeof v === 'object' && v.$eq !== undefined) {
            setByPath(base, k, cloneDoc(v.$eq))
          }
        }
        const newDoc = applyUpdate(base, cmd.update || {})
        if (newDoc._id === undefined) {
          newDoc._id = new ObjectId()
        }
        coll.push(newDoc)
        store.scheduleSave()
        return {
          lastErrorObject: { n: 1, updatedExisting: false, upserted: newDoc._id },
          value: cmd.new ? cloneDoc(newDoc) : null,
          ok: 1,
        }
      }
      return {
        lastErrorObject: { n: 0, updatedExisting: false },
        value: null,
        ok: 1,
      }
    }

    const targetIdx = indices[0]
    const beforeDoc = cloneDoc(coll[targetIdx])

    if (cmd.remove) {
      coll.splice(targetIdx, 1)
      store.scheduleSave()
      return {
        lastErrorObject: { n: 1 },
        value: beforeDoc,
        ok: 1,
      }
    }

    const updatedDoc = applyUpdate(beforeDoc, cmd.update || {})
    coll[targetIdx] = updatedDoc
    store.scheduleSave()

    return {
      lastErrorObject: { n: 1, updatedExisting: true },
      value: cmd.new ? cloneDoc(updatedDoc) : beforeDoc,
      ok: 1,
    }
  }

  if (action === 'delete') {
    const collName = cmd.delete
    const deletes = cmd.deletes || []
    let coll = store.getCollection(dbName, collName)
    let deletedCount = 0

    for (const dSpec of deletes) {
      const indices = store.findMatchingIndices(coll, dSpec.q || {})
      if (indices.length > 0) {
        const toRemove = dSpec.limit === 1 ? new Set([indices[0]]) : new Set(indices)
        deletedCount += toRemove.size
        coll = coll.filter((_, idx) => !toRemove.has(idx))
        store.setCollection(dbName, collName, coll)
      }
    }

    if (deletedCount > 0) {
      store.scheduleSave()
    }
    return { n: deletedCount, ok: 1 }
  }

  if (action === 'getMore') {
    return {
      cursor: {
        id: Long.fromNumber(0),
        ns: `${dbName}.${cmd.collection || ''}`,
        nextBatch: [],
      },
      ok: 1,
    }
  }

  return { ok: 1 }
}

export function startLocalMongoServer(port = 27017, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const testSocket = new net.Socket()
    testSocket.setTimeout(400)

    testSocket.once('connect', () => {
      testSocket.destroy()
      resolve({ alreadyRunning: true, port, host })
    })

    testSocket.once('error', () => {
      testSocket.destroy()
      launchServer()
    })

    testSocket.once('timeout', () => {
      testSocket.destroy()
      launchServer()
    })

    testSocket.connect(port, host)

    function launchServer() {
      const store = new LocalMongoStore()
      const server = net.createServer((socket) => {
        let buffer = Buffer.alloc(0)

        socket.on('data', (chunk) => {
          buffer = Buffer.concat([buffer, chunk])

          while (buffer.length >= 16) {
            const messageLength = buffer.readInt32LE(0)
            if (buffer.length < messageLength) break

            const msgBuf = buffer.subarray(0, messageLength)
            buffer = buffer.subarray(messageLength)

            const requestID = msgBuf.readInt32LE(4)
            const opCode = msgBuf.readInt32LE(12)

            try {
              if (opCode === 2004) {
                let offset = 20
                while (offset < msgBuf.length && msgBuf[offset] !== 0) offset++
                offset += 1 + 8
                const docSize = msgBuf.readInt32LE(offset)
                const queryDoc = BSON.deserialize(msgBuf.subarray(offset, offset + docSize))
                const responseDoc = executeCommand(store, queryDoc)
                socket.write(buildOpReplyResponse(requestID, responseDoc))
              } else if (opCode === 2013) {
                const cmdDoc = parseOpMsg(msgBuf)
                const responseDoc = executeCommand(store, cmdDoc)
                socket.write(buildOpMsgResponse(requestID, responseDoc))
              }
            } catch (err) {
              console.error('[LocalMongo] Command error:', err)
              const errDoc = { ok: 0, errmsg: err.message || 'Internal error', code: 1 }
              socket.write(
                opCode === 2004
                  ? buildOpReplyResponse(requestID, errDoc)
                  : buildOpMsgResponse(requestID, errDoc),
              )
            }
          }
        })

        socket.on('error', () => {})
      })

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve({ alreadyRunning: true, port, host })
        } else {
          reject(err)
        }
      })

      server.listen(port, host, () => {
        console.log(`[LocalMongo] Listening on mongodb://${host}:${port}`)
        resolve({ server, store, port, host })
      })
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startLocalMongoServer(27017, '127.0.0.1')
}
