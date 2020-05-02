'use strict'

const express = require('express')
var body_parser = require('body-parser')
// Constants
const PORT = 8080
const HOST = '0.0.0.0'

// const PORT = 8080       // DATOS PARA EL SEVIDOR
// const HOST = '0.0.0.0'

var cors = require('cors')
var url = require('url')
var queryString = require('querystring')

// App
const app = express()
app.use(cors())
app.use(body_parser.urlencoded({ extended: true }))
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
  jwt.verify(theUrl.query.jwt, public_key, opts, function (err, decoded) {
    if (err) {
      var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
      res2.send(respuesta)
    } else {
      const scope = JSON.parse(decoded.scope)
      // EJEMPLO DE COMO LEER EL SCOPE
      let access = ''
      access = scope.find(element => element.toLowerCase() == 'afiliado.get')

      if (access != undefined) {
        // SI TIENE ACCESO
        autorizacion = true
      }
    }
  })

  if (autorizacion) {
    console.log(theUrl.query)
    var json2 = null
    if (theUrl.query.codigo == undefined) {
      json2 = null
    } else {
      // var queryObj = queryString.parse(theUrl.query)
      // console.log(queryObj)
      var qdata = theUrl.query
      if (qdata.codigo !== undefined) {
        var iddd = parseInt(qdata.codigo)
        var parajson = '{' + '\"codigo\":' + iddd + ',\"password\":\"' + qdata.password + '\"}'
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
          dbo.collection('Usuario').find(json).toArray(function (err, res) {
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
app.post('/Afiliado', (req, res2) => {
  var autorizacion = false
  // req.body
  // console.log(req.body)
  // console.log(req.body.name)
  var theUrl = url.parse(req.url, true)
  jwt.verify(req.body.jwt, public_key, opts, function (err, decoded) {
    if (err) {
      var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
      res2.send(respuesta)
    } else {
      const scope = JSON.parse(decoded.scope)
      // EJEMPLO DE COMO LEER EL SCOPE
      let access = ''
      access = scope.find(element => element.toLowerCase() == 'afiliado.post')

      if (access != undefined) {
        // SI TIENE ACCESO
        autorizacion = true
      }
    }
  })

  if (autorizacion) {
    var numram = Math.floor(Math.random() * (999 - 1)) + 1
    var fov
    if (req.body.vigente === 'false') {
      fov = false
    } else {
      fov = true
    }
    var toindd = parseInt(req.body.tipo)
    var json2 = {
      _id: numram,
      codigo: numram,
      nombre: req.body.nombre,
      password: req.body.password,
      correa: req.body.correa,
      tipo: toindd,
      vigente: fov
    }

    if (req.body.nombre == '' || req.body.password == '') {
      var respuesta = JSON.parse('{ "cod":406, "state":"Not Acceptable"}')
      return res2.send(respuesta)
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
          // var respuesta = JSON.parse('{ "codigo":\"'+json2._id+', "nombre":'+json2.nombre+', "vigente":'+false+'}')
          client.close()
        })
        console.log('Conexion Exitosa')
      })
      return true
    }
    Insert(json2)
    var respuesta = JSON.parse('{ "codigo":\"' + json2._id + '\", "nombre":\"' + json2.nombre + '\", "vigente":' + false + '}')
    var sdfe = {
      codigo: json2._id,
      nombre: json2.nombre,
      vigente: false
    }
    res2.send(sdfe)
  }
})

app.put('/Afiliado', (req, res2) => {
  // console.log(req.body)
  var theUrl = url.parse(req.url, true)
  var autorizacion = false
  jwt.verify(req.body.jwt, public_key, opts, function (err, decoded) {
    if (err) {
      var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
      res2.send(respuesta)
    } else {
      const scope = JSON.parse(decoded.scope)
      // EJEMPLO DE COMO LEER EL SCOPE
      let access = ''
      access = scope.find(element => element.toLowerCase() == 'afiliado.put')

      if (access != undefined) {
        // SI TIENE ACCESO
        autorizacion = true
      }
    }
  })

  if (autorizacion) {
    console.log(req.body)

    var anews = parseInt(req.body._id)
    var datoid = { _id: anews }
    console.log(datoid)
    var newdato = ''
    if (req.body.password == '' && req.body.nombre == '') {
      var estain = parseInt(req.body._id)
      newdato = { $set: { _id: estain } }
      var respuesta = JSON.parse('{ "cod":406, "state":"Not Acceptable"}')
      return res2.send(respuesta)
    } else if (req.body.password != undefined && req.body.nombre == undefined) {
      var estain = parseInt(req.body._id)
      newdato = { $set: { _id: estain, password: req.body.password } }
    } else if (req.body.password != undefined && req.body.nombre != undefined) {
      var estain = parseInt(req.body._id)
      newdato = { $set: { _id: estain, password: req.body.password, nombre: req.body.nombre } }
    }
    // newdato = { $set: { estado: req.body.estado, afiliado: req.body.afiliado_adjudicado, valor_adjudicado: req.body.valor_adjudicado } }
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
              var sdfe = {
                cod: datoid._id,
                nombre: req.body.nombre,
                vigente: false
              }
              res2.send(sdfe)
              // var resull = { response: true }
              // res2.send(resull)
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

app.get('/Pago', (req, res2) => {
  var theUrl = url.parse(req.url, true)
  var autorizacion = false
  jwt.verify(theUrl.query.jwt, public_key, opts, function (err, decoded) {
    if (err) {
      var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
      res2.send(respuesta)
    } else {
      const scope = JSON.parse(decoded.scope)
      // EJEMPLO DE COMO LEER EL SCOPE
      let access = ''
      access = scope.find(element => element.toLowerCase() == 'pago.get')

      if (access != undefined) {
        // SI TIENE ACCESO
        autorizacion = true
      }
    }
  })

  if (autorizacion) {
    console.log(theUrl.query)
    var json2 = null
    if (theUrl.query.codigo == '') {
      json2 = null
    } else {
      // var queryObj = queryString.parse(theUrl.query)
      // console.log(queryObj)
      var qdata = theUrl.query
      if (qdata.codigo !== undefined) {
        var iddd = parseInt(qdata.codigo)
        var parajson = '{' + '\"codigo\":' + iddd + '}'
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
            res2.send(res)
          })
        } else {
          dbo.collection('Usuario').find(json).toArray(function (err, res) {
            if (err) throw err
            console.log('Dato Encontrado Correctamente find')
            // console.log(res)
            client.close()
            if (res.length === 0) {
              var respuesta = JSON.parse('{ "cod":404, "state":"Not found"}')
              res2.send(respuesta)
            } else {
              var resull = { response: res }
              res2.send(res)
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

app.post('/Pago', (req, res2) => {
  var autorizacion = false
  // console.log(req.body)
  // console.log(req.body.name)
  var theUrl = url.parse(req.url, true)
  jwt.verify(req.body.jwt, public_key, opts, function (err, decoded) {
    if (err) {
      var respuesta = JSON.parse('{ "cod":403, "err":"El JWT no es valido o no contiene el scope de este servicio"}')
      res2.send(respuesta)
    } else {
      const scope = JSON.parse(decoded.scope)
      // EJEMPLO DE COMO LEER EL SCOPE
      let access = ''
      access = scope.find(element => element.toLowerCase() == 'pago.post')

      if (access != undefined) {
        // SI TIENE ACCESO
        autorizacion = true
      }
    }
  })
  if (autorizacion) {
    console.log(req.body)

    var anews = parseInt(req.body.codigo)
    var datoid = { _id: anews }
    console.log(datoid)
    var newdato = ''
    if (req.body.monto == '') {
      var respuesta = JSON.parse('{ "cod":406, "state":"Not Acceptable"}')
      return res2.send(respuesta)
    } else {
      var hoy = new Date()
      var dd = hoy.getDate()
      var mm = hoy.getMonth() + 1
      var yyyy = hoy.getFullYear()
      var hh = hoy.getHours()
      var mmi = hoy.getMinutes()
      var ss = hoy.getSeconds()

      var fechas = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mmi + ':' + ss

      var estain = parseInt(req.body.codigo)
      var mmonto = parseFloat(req.body.monto)
      newdato = { $set: { _id: estain, monto: mmonto, fecha: fechas } }
      if (req.body.vigente == 'true') {
        newdato = { $set: { _id: estain, monto: mmonto, fecha: fechas, vigente: true } }
      } else if (req.body.vigente == 'false') {
        newdato = { $set: { _id: estain, monto: mmonto, fecha: fechas, vigente: false} }
      }
    }
    // newdato = { $set: { estado: req.body.estado, afiliado: req.body.afiliado_adjudicado, valor_adjudicado: req.body.valor_adjudicado } }
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
              var sdfe = {
                cod: datoid._id,
                nombre: req.body.nombre,
                vigente: false
              }
              res2.send(sdfe)
              // var resull = { response: true }
              // res2.send(resull)
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
