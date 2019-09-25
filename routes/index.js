var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var models = require('../mongoData')(mongoose);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
  res.render('helloworld', {
    title: 'Hello, World!'
  });
});

/* GET json data. */
router.get('/json', function(req, res, next) {
  //console.log(req.db);
  req.db.findOne({
    'name': req.query.name
  }).exec(function(err, migration) {
    if (migration)
      res.json(migration.json);
    else
      res.json(null);
  });
});

/* POST data */
router.post('/addMigration', function(req, res) {

  console.log('Adding migration : ' + req.body.addMigrationTitle + req.body.addMigrationJSON);

  var migrationObject = new models.Migration({
    name: req.body.addMigrationTitle,
    json: JSON.parse(req.body.addMigrationJSON)
  });

  migrationObject.save(function(err) {
    if (err) throw err;
    res.send('Migration saved successfully!');
  });
});

router.post('/update', function(req, res) {

  console.log('Updating migration : ' + req.body.updateMigrationTitle);

  req.db.findOne({
    url: JSON.parse(req.body.updateMigrationJSON).url
  }).exec(function(err, migration) {

    migration.json = JSON.parse(req.body.updateMigrationJSON);
    migration.save(function(err) {
      if (err) throw err;
      res.send('Migration saved successfully!');
    });

  });

});

module.exports = router;
