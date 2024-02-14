const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'covid19India.db')

const app = express()
app.use(express.json())

let db = null

const InitialzeAndRunServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Running server at....')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

InitialzeAndRunServer()

app.get('/states/', async (request, response) => {
  const query = `select * from state order by state_id;`
  const Array = await db.all(query)
  response.send(Array)
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const query = `select * from state where state_id =${stateId};`
  const Array = await db.get(query)
  response.send(Array)
})

app.post('/districts/', async (request, response) => {
  const districtsAdd = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtsAdd
  const query = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) VALUES ("${districtName}",${stateId},${cases},
  ${cured},${active},${deaths});`

  const AddedArray = db.run(query)
  response.send('District Successfully Added')
})
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `select * from district where district_id =${districtId};`
  const Array = await db.get(query)
  response.send(Array)
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `DELETE from district WHERE district_id = ${districtId};`
  await db.run(query)
  response.send('District Removed')
})

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const update = request.body
  const {districtName, stateId, cases, cured, active, deaths} = update
  const query = `update district SET district_name='${districtName}', state_id =${stateId} , cases =${cases},active=${active}
  , deaths =${deaths},  cured= ${cured} where district_id = ${districtId} ;`
  await db.run(query)
  response.send('District Details Updated')
})

app.get('/states/:stateId/stats', async (request, response) => {
  const {stateId} = request.params
  const query = `select sum(cases) as cases
  ,sum(cured) as cured ,sum(active) as active ,sum(deaths) as deaths from district where state_id =${stateId};`
  const Array = await db.all(query)
  response.send(Array)
})

