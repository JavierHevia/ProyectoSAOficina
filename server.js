'use strict'

const express = require('express')

// Constants
const PORT = 7070
const HOST = '127.0.0.1'

// const PORT = 8080       // DATOS PARA EL SEVIDOR
// const HOST = '0.0.0.0'

var cors = require('cors')
var url = require('url')
var queryString = require('querystring')

// App
const app = express()
app.use(cors())

// jwt
const jwt = require('jsonwebtoken')
const opts = { algorithms: ['RS256'] }

// public key
var public_key = '-----BEGIN PUBLIC KEY-----\n' +
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOp7P/J9U+6VN+BQDcIWyzvMPVnqmRz5\n' +
  'z6HNUfcDOsSEk2egtxuBBgAF75OlLxMXi/KyNlb5sNy5qIxrTEv8IYMCAwEAAQ==\n' +
  '-----END PUBLIC KEY-----\n'

app.get('/', (req, res) => {
  res.send('OFiCINA')
})

app.get('/Afiliado', (req, res2) => {
  var theUrl = url.parse(req.url, true)
  var autorizacion = false
  // jwt.verify(theUrl.query.jwt, public_key, opts, function (err, decoded) {
  //   if (err) {
  //     var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
  //     res2.send(respuesta)
  //   } else {
  //     const scope = JSON.parse(decoded.scope)
  //     // EJEMPLO DE COMO LEER EL SCOPE
  //     let access = ''
  //     access = scope.find(element => element.toLowerCase() == 'vehiculo.get')

  //     if (access != undefined) {
  //       // SI TIENE ACCESO
  //       autorizacion = true
  //     }
  //   }
  // })

  if (!autorizacion) {
    console.log(theUrl.query)
    var json2 = null
    if (theUrl.query == null) {
      json2 = null
    } else {
      // var queryObj = queryString.parse(theUrl.query)
      // console.log(queryObj)
      var qdata = theUrl.query
      if (qdata.codigo !== undefined) {
        var iddd = parseInt(qdata.codigo)
        var parajson = '{' + '\"_id\":' + iddd + ',\"contrasena\":' + qdata.password + '}'
        json2 = JSON.parse(parajson)
        console.log(json2)
      }
    }

    var MongoClient = require('mongodb').MongoClient
    var uri = 'mongodb://admin1:admin@cluster0-shard-00-00-k6sn1.mongodb.net:27017,cluster0-shard-00-01-k6sn1.mongodb.net:27017,cluster0-shard-00-02-k6sn1.mongodb.net:27017/Base1?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'

    function Insert (json) {
      MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err
        var dbo = client.db('Base1') // .collection('Base1')

        if (json == null) {
          dbo.collection('Usuario').find({}).toArray(function (err, res) {
            if (err) throw err
            console.log('Dato Encontrado Correctamente')
            // console.log(res)
            client.close()
            var resull = { response: res }
            res2.send(resull)
          })
        } else {
          dbo.collection('Inventario').find(json).toArray(function (err, res) {
            if (err) throw err
            console.log('Dato Encontrado Correctamente find')
            // console.log(res)
            client.close()
            if (res.length === 0) {
              var respuesta = JSON.parse('{ "cod":404, "state":"Not found"}')
              res2.send(respuesta)
            } else {
              var resull = { response: res }
              res2.send(resull)
              // res2.send(res)
            }
          })
        }
      })
      return true
    }
    Insert(json2)
  }
})

app.use(express.json())
app.post('/Afiliado', (req, res) => {
  // console.log(req.body)
  // console.log(req.body.name)
  var subastable2 = parseInt(req.body.subastable)
  var json2 = {
    nombre: req.body.nombre,
    password: req.body.password
  }

  var MongoClient = require('mongodb').MongoClient
  var uri = 'mongodb://admin1:admin@cluster0-shard-00-00-k6sn1.mongodb.net:27017,cluster0-shard-00-01-k6sn1.mongodb.net:27017,cluster0-shard-00-02-k6sn1.mongodb.net:27017/Base1?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'

  function Insert (json) {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
      if (err) throw err
      var dbo = client.db('Base1') // .collection('Base1')
      dbo.collection('Usuario').insertOne(json, function (err, _res) {
        if (err) throw err
        console.log('Dato Insertado Correctamente')
        client.close()
        return true
      })
      console.log('Conexion Exitosa')
    })
    return true
  }
  Insert(json2)
  res.send('Insertado Correctamente')
})

app.put('/Afiliado', (req, res2) => {
  // console.log(req.body)
  var theUrl = url.parse(req.url, true)
  var autorizacion = false
  // jwt.verify(theUrl.query.jwt, public_key, opts, function (err, decoded) {
  //   if (err) {
  //     var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
  //     res2.send(respuesta)
  //   } else {
  //     const scope = JSON.parse(decoded.scope)
  //     // EJEMPLO DE COMO LEER EL SCOPE
  //     let access = ''
  //     access = scope.find(element => element.toLowerCase() == 'vehiculo.get')

  //     if (access != undefined) {
  //       // SI TIENE ACCESO
  //       autorizacion = true
  //     }
  //   }
  // })
  if (!autorizacion) {
    console.log(theUrl.query)

    var anews = parseInt(theUrl.query._id)
    var datoid = { _id: anews }
    console.log(datoid)
    var newdato = ''
    if (theUrl.query.password == undefined && theUrl.query.nombre == undefined) {
      var estain = parseInt(theUrl.query._id)
      newdato = { $set: { _id: estain } }
    } else if (theUrl.query.password != undefined && theUrl.query.nombre == undefined) {
      var estain = parseInt(theUrl.query._id)
      newdato = { $set: { _id: estain, password: theUrl.query.password } }
    } else if (theUrl.query.password != undefined && theUrl.query.nombre != undefined) {
      var estain = parseInt(theUrl.query._id)
      newdato = { $set: { _id: estain, password: theUrl.query.password, nombre: theUrl.query.nombre } }
    }
    // newdato = { $set: { estado: theUrl.query.estado, afiliado: theUrl.query.afiliado_adjudicado, valor_adjudicado: theUrl.query.valor_adjudicado } }
    console.log(newdato)

    var MongoClient = require('mongodb').MongoClient
    var uri = 'mongodb://admin1:admin@cluster0-shard-00-00-k6sn1.mongodb.net:27017,cluster0-shard-00-01-k6sn1.mongodb.net:27017,cluster0-shard-00-02-k6sn1.mongodb.net:27017/Base1?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'

    function update (obj1, newdato) {
      MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err
        var dbo = client.db('Base1') // .collection('Base1')
        dbo.collection('Usuario').find(obj1).toArray(function (err, res) {
          if (err) throw err
          // console.log('Dato Encontrado Correctamente')
          console.log(res)
          // client.close()
          if (res.length === 0) {
            var respuesta = JSON.parse('{ "cod":404, "state":"Not found"}')
            res2.send(respuesta)
            // console.log('vacio')
          } else {
            dbo.collection('Usuario').updateOne(obj1, newdato, function (err, res) {
              if (err) throw err
              console.log('Dato Encontrado Correctamente')
              // console.log(res)
              client.close()
              // var respuesta = JSON.parse('{ "cod":201, "state":"Created"}')
              var resull = { response: true }
              res2.send(resull)
            })
            console.log('Conexion Exitosa')
          }
        })
      })
      return true
    }
    update(datoid, newdato)
  }
})

app.listen(PORT, HOST)
console.log('Servidor levantado http://' + HOST + ':' + PORT)
