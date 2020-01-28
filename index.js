require('dotenv').config();
const web = require('elara-webserver'), app = new web();

app
.setPort(4040)
.setSecret(process.env.SECRET)
.setDirectory(require('path').join(__dirname, "views"))
.setMongoURL(process.env.MONGO)
.setViewEngine("ejs")
let router = app.startWebsite();
router.use("/dbl", require('./routes/dbl'));

router.get("/", (req, res) => res.render('index'));