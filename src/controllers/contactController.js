const db = require('../db/conn');
const { Contact} = db;



module.exports = {
    //Contact Model
    createContact: async (req, res, next) => {
        try {

            const { name,email,message } = req.body;

            if (!name) {
                return res.render('pages/success',{
                    status: false,
                    message: 'Name is required'
                })
            }
            if (!email) {
                return res.render('pages/success',{
                    status: false,
                    message: 'Email is required'
                })
            }
            if (!message) {
                return res.render('pages/success',{
                    status: false,
                    message: 'Message is required'
                })
            }



            const ContactModel = new Contact(req.body);
            const created = await ContactModel.save();

            return res.render('pages/success',{
                status: true,
                message: 'success'
            })

        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },

    getAllContactList: async (req, res, next) => {
        try {
           
            


            const reqBody = req.body;
            
           
           
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10; 
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            const data = await Contact.find().sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await Contact.count();
console.log(data)

            return res.send({ status: true, data: data, count: count, message: 'Contact List get successfully' });


        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },




    deleteContact: async (req, res, next) => {
        try {
            const { _id } = req.body;


            if (!_id) {
                return res.send({ status: false, message: '_id is required' });
            }


            const deleted = await Contact.findOneAndRemove({ _id: _id }).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'Contact not found' });
            }

            return res.send({ status: true, message: 'Contact deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },







}

