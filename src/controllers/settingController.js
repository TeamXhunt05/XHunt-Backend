const db = require('../db/conn');
const { Setting, UserLogins , Store } = db;

module.exports = {
  list: async (req, res, next) => {
    try {
      let settings = await Setting.find({}).lean().exec();
      let _id = req.body._id;
      let isAddStore = false
      let user = {};
      if(!['', null, undefined].includes(_id)) { 
        user = await UserLogins.findById(_id);
        let getStore = await Store.findOne({user_id : _id})
        if(getStore){
          isAddStore = true;
        }
       
      }
      res.status(200).send({
        settings: settings.reverse(),
        user_detail: user ,
        isAddStore : isAddStore
      });
    } catch (e) {
      
      res.send(e);
    }
  },

  create: async (req, res, next) => {
    const { option, value } = req.body;
    
    let setting = await Setting.find({ option: option });
    if (setting.length > 0) {
      return res.json({ status: 401, message: "Setting already exists" });
    }

    const settingData = Setting(req.body);

    await settingData.save();
    return res.send({
      status: 200,
      message: "Setting has been successfully added.",
    });
  },

  edit: async (req, res, next) => {
    let id = req.params.id;
    let setting = await Setting.findById(id);
    res.send({ status: 200, setting: setting });
  },

  update: async (req, res, next) => {
    let id = req.params.id;

    const { option, value } = req.body;

    let setting = await Setting.find({ option: option, _id: { $ne: id } });
    
    if (setting.length > 0) {
      return res.json({ status: 401, message: "Setting already exists" });
    }

    await Setting.findByIdAndUpdate(id, {
      option: option,
      value: value,
    });

    res.send({ status: 200, msg: "Setting has been successfully updated." });
  },
};

