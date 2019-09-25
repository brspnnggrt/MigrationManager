module.exports = function(mongoose) {

	var models;
	
	if (mongoose.models.Migration)
	{
		models = {
			Migration : mongoose.model('Migration')
		}
		return models;
	}

	var migrationSchema = new mongoose.Schema({
		name: String,
		json: Object
	});

	models = { 
		Migration : mongoose.model('Migration', migrationSchema)
	};

    return models;
}
