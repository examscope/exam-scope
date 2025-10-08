const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');
require('dotenv').config();

let frontendLink = process.env.FRONTEND;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT
});
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

const store = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT
});

app.use(cors({
    origin: url,
    credentials: true
}));

app.use(session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
    secure: true,       // HTTPS only
    sameSite: 'none'    // allow cross-site cookies
    }
}));

app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  if (req.path.indexOf('.') === -1) {
    res.sendFile(path.join(__dirname, "public", req.path + ".html"), err => {
      if (err) next();
    });
  } else {
    next();
  }
});

////////////////////////// REUSABLE FUNCTIONS //////////////////////////
function requireUser(req, res, next){
	if(!req.session.user){
		return res.redirect("/login");
	}
	next();
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'marceauowen@gmail.com', 
        pass: 'cgor gzwc vkxz htka'
    }
});
function sendVerificationEmail(userEmail, code) {  
    const mailOptions = {
        from: 'marceauowen@gmail.com',  // Sender address
        to: userEmail,                 // Receiver's email
        subject: 'Email Verification', // Subject line
        text: `Here is your verification code: ${code}`,
        html: `<p>Here is your verification code: ${code}</p>`
    };
  
    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
}
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
function requireLogged(req, res, next){
    if(req.session.userId){
        db.query("select * from users where id = ?", [req.session.userId], (err, result) => {
            if(err){
                console.error("Error checking logged requirement: " + err);
            }

            if(result.length < 1 || result[0].status != "2"){
                return res.redirect("/");
            }

            next();
        });
    } else {
        return res.redirect("/");
    }
}
function checkLogged(req, res, next){
    if(!req.session.userId){
        return res.json({ message: 'no account' });
    }
    next();
}




////////////////////////// SERVE CUSTOM PRIVATE FILES //////////////////////////
app.get("/sign-up", (req, res) => {
    // status 0 = not verified
    // status 1 = verified, not onboarded
    // status 2 = verified, onboarded

    let onboarding = req.query.onboarding;
	if(onboarding != "true" && onboarding != "false"){
		return res.status(404).send("Page not found, param not set.");
	}

    if (!req.session.userId) {
        if(onboarding == "true"){
            return res.sendFile(path.join(__dirname, 'public', 'index.html'));
        } else {
            return res.sendFile(path.join(__dirname, 'private', 'sign-up.html'));
        }
    }

    let onboardingAllowed = true;
    const searchEmailQuery = "select * from users where id = ?";
    db.query(searchEmailQuery, [req.session.userId], (err, result) => {
        if(err){
            console.error("Error searching for users email: " + err);
        }

        if(result.length == 0){
            console.error("no email found");
            req.session.destroy(err => {
                if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: 'failed' });
                }
                return res.status(200).json({ message: 'success' });
            });
            return res.sendFile(path.join(__dirname, 'public', 'index.html'));
        } else if(result[0].status != "1") {
            onboardingAllowed = false;
        }

        if(onboarding == "true" && !onboardingAllowed){
            return res.sendFile(path.join(__dirname, 'public', 'index.html'));
        } else if(onboarding == "false" && result[0].status != "0"){
            return res.sendFile(path.join(__dirname, 'public', 'index.html'));
        } else {
            res.sendFile(path.join(__dirname, 'private', 'sign-up.html'));
        }
    });
});

app.get("/login", (req, res) => {
    if(req.session.userId){
        db.query("select * from users where id = ?", [req.session.userId], (err, result) => {
            if(err){
                console.error("Error checking status for login: " + err);
            } 

            if(result.length > 0 && result[0].status != 0){
                return res.redirect("/");
            }
        });
    }

    return res.sendFile(path.join(__dirname, 'private', 'login.html'));
});

app.get("/verify", (req, res, next) => {
    const tenMinutes = 10 * 60 * 1000;
    if(!req.session.creating){
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else if(req.session.creating && (Date.now() - req.session.creatingSetAt) > tenMinutes){
        req.session.creating = false;
        delete req.session.creatingSetAt;
        return res.redirect("/expired.html");
    }

    next();
}, (req, res) => {
    res.sendFile(__dirname + '/private/verify.html');
});

app.get("/papers", (req, res) => {
    return res.sendFile(path.join(__dirname, 'private', 'past-papers.html'));
});

app.get("/papers/:certificate/:subject/:level", (req, res) => {
    return res.sendFile(path.join(__dirname, 'private', 'past-papers.html'));
});

app.get("/worksheets", (req, res) => {
    return res.sendFile(path.join(__dirname, 'private', 'worksheet-builder.html'));
});

app.get("/worksheets/:certificate/:subject/:level", (req, res) => {
    return res.sendFile(path.join(__dirname, 'private', 'worksheet-builder.html'));
});

app.get("/settings", requireLogged, (req, res) => {
    return res.sendFile(path.join(__dirname, 'private', 'settings.html'));
});

app.get('/topics/:certificate/:subject/:level', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/topics.html'));
});

app.get('/questions/:certificate/:subject/:level/:topic', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/questions.html'));
});

app.get("/api/images/:certificate/:subject/:level/:topic", (req, res) => {
    let certificate = req.params.certificate;
    let subject = req.params.subject;
    let level = req.params.level;
    let topic = req.params.topic;

    if(certificate == "leaving-certificate"){
        certificate = "lc";
    } else {
        certificate = "jc";
    }

    imageQuery = "select * from new_images where certificate = ? and subject = ? and level = ? and slug = ? order by id asc"
    db.query(imageQuery, [certificate, subject, level, topic], (err, result) => {
        if(err){
            console.error("Error fetching images: " + err)
        }
        res.json(result)
    });
});

app.get('/quiz/:certificate/:subject/:level/:topic', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/quiz.html'));
});




////////////////////////// APIS ROUTES //////////////////////////
app.post("/api/signup", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const checkTakenQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkTakenQuery, [email], (err, result) => {
        if(err){
            console.error("Error checking if email is taken");
        }

		// If a user with the same username exists, return an error
		if(result.length > 0 && result[0].email_verified == 0){
			const deleteQuery = "delete from users where id = ?";
			db.query(deleteQuery, [result[0].id], (err, result) => {
				if(err){
					console.error("Error deleting unverified user: " + err);
				}
			});
		} else if(result.length > 0) {
            return res.json({ message: 'email taken' });
		}

		const valid = isValidEmail(email);
		if(!valid){
			return res.json({ message: 'invalid email' });
		}

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Error hashing password');
            }

            const code = Math.floor(100000 + Math.random() * 900000);
            const query = 'INSERT INTO users (email, password_hash, email_verified, verification_code, status) VALUES (?, ?, ?, ?, ?)';
            db.query(query, [email, hashedPassword, 0, code, "0"], (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.json({ message: 'failure' });
                }

                db.query("select * from users where email = ?", [email], (err, result) => {
                    if(err){
                        console.error(err);
                    }

                    req.session.userId = result[0].id;
                    req.session.creating = true;
                    req.session.creatingSetAt = Date.now();
                    
                    // Redirect to index page after a short delay
                    setTimeout(() => {
                        sendVerificationEmail(email, code);
                        return res.json({ message: 'success' });
                    }, 500);
                });
            });
        });
    });
});

app.post("/api/profile", (req, res) => {
    const studentName = req.body.studentName;
    const username = req.body.username;
    const role = req.body.role;

    db.query("select * from users where username = ?", [username], (err, result) => {
        if(err){
            console.error("Error checking if username exists");
        }

        if(result.length > 0){
            return res.json({ message: 'username taken' });
        }

        const findUserQuery = "update users set role = ?, student_name = ?, username = ? where id = ?";
        db.query(findUserQuery, [role, studentName, username, req.session.userId], (err, result) => {
            if(err){
                console.error("error finding email form DB: ", err);
            }

            if(result.length == 0){
                console.error("no email found");
                return res.json({ message: 'no email found' });
            }

            req.session.username = username;

            return res.json({ message: 'success' });
        });
    });
});

app.post("/api/post-subjects", (req, res) => {
    const subjects = req.body.subjects;

    let values = [];
    db.query("select * from users where id = ?", [req.session.userId], (err, result) => {
        if(err){
            console.error("Error selecting all users: " + err);
        }

        subjects.forEach((str, idx) => {
            values.push([result[0].id, str.split("_")[2], str.split("_")[1], str.split("_")[0]]);
        });


        const subjectQuery = "insert into subjects (user_id, subject_name, level, certificate_type) values ?";
        db.query(subjectQuery, [values], (err, result) => {
            if(err){
                console.error("Error inserting subjects: " + err);
            }
            return res.json({ message: "success" }); 
        });
    });
});

app.post("/api/edit-subjects", (req, res) => {
    const subjects = req.body.subjects;
        
    db.query("delete from subjects where user_id = ?", [req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        let values = [];
        subjects.forEach((str, idx) => {
            values.push([req.session.userId, str.split("_")[2], str.split("_")[1], str.split("_")[0]]);
        });

        const subjectQuery = "insert into subjects (user_id, subject_name, level, certificate_type) values ?";
        db.query(subjectQuery, [values], (err, result) => {
            if(err){
                console.error("Error inserting subjects: " + err);
            }
            return res.json({ message: "success" }); 
        });
    });
});

app.get("/api/status2", (req, res) => {
    const statusQuery =  "update users set status = ? where username = ?";
    db.query(statusQuery, ["2", req.session.username], (err, result) => {
        if(err){
            console.error("Error updating status to 2: " + err);
        }
        return res.json({ message: "success" })
    });
});

app.post("/api/verify", (req, res) => {
    const code = req.body.code;

    const codeQuery = "select * from users where verification_code = ?";
    db.query(codeQuery, [code], (err, result) => {
        if(err){
            console.error("Error checking verification code: ", err);
        }

        if(result.length == 0){
            return res.json({ message: "invalid" });
        } else {
            delete req.session.creating;
            delete req.session.creatingSetAt;
            
            const insertVerifiedQuery = "update users set verification_code = ?, email_verified = ?, status = ? where verification_code = ?;";
            db.query(insertVerifiedQuery, [null, 1, "1", code], (err, result) => {
                if(err){
                    console.error("Error inserting verify stuff: " + err);
                }

                return res.json({ message: "success" });
            });
        }
    });
});

app.post("/api/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    const remember = req.body.remember;

    const findUserQuery = "select * from users where email = ? and email_verified = ?";
    db.query(findUserQuery, [email, "1"], (err, result) => {
        if(err){
            console.error("Error finding users: " + err);
            return res.json({ message: 'failure' });
        }

        if(result.length == 0){
            return res.json({ message: 'no user' });
        }

        bcrypt.compare(password, result[0].password_hash, (err, isMatch) => {
            if(err){
                console.error("Error comparing passwords: " + err);
                return res.json({ message: 'failure' });
            }
            if(!isMatch){
                return res.json({ message: 'invalid password' });
            }

            req.session.userId = result[0].id;
            return res.json({ message: 'success' });
        });
    });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: 'failed' });
        }
        return res.json({ message: 'success' });
    });
});

app.get("/api/is-guest", (req, res) => {
    if(req.session.userId){
        db.query("select * from users where id = ?", [req.session.userId], (err, result) => {
            if(err){
                console.error("Error finding user: " + err);
                return res.json({ message: 'failure' });
            }

            
            if(result.length > 0){
                const { id, role, student_name, email, username, status } = result[0];
                const okayData = { id, role, student_name, email, username, status };
                if(result[0].status == 1){
                    return res.json({ message: 'not onboarded', userData: okayData });
                } else if(result[0].status == 2){
                    db.query("select * from subjects where user_id = ?", [okayData.id], (err, result) => {
                        if(err){
                            console.error(err);
                        }
                       
                        return res.json({ message: 'logged', userData: okayData, subjects: result });
                    });
                } else {
                    return res.json({ message: 'guest', userData: okayData });
                }
            }
        });
    } else {
        return res.json({ message: 'guest' });
    }
});

app.get("/api/settings-data", (req, res) => {
    const getUserData = "select * from users where id = ?";
    db.query(getUserData, [req.session.userId], (err, result) => {
        if(err){
            console.error("Error getting users table: " + err);
        }

        if(result.length > 0){
            const { email, id, role, student_name, username } = result[0];
            const userObj = { email, id, role, student_name, username };
            const getSubjectData = "select * from subjects where user_id = ?";
            db.query(getSubjectData, [userObj.id], (err, result) => {
                if(err){
                    console.error("Error getting subject data: " + err);
                }
                
                const subjectObj = result;
                return res.json({ message: 'success', userData: userObj, subjectData: subjectObj });
            });
        } else {
            return res.json({ message: 'no user' });
        }
    });
});

app.post("/api/settings-change", (req, res) => {
    const data = req.body.data;
    const value = req.body.value;

    const code = Math.floor(100000 + Math.random() * 900000);
    if(data.ui == "username"){
        db.query("select * from users where username = ?", [value], (err, result) => {
            if(err){
                console.error("Error checking if username exists: " + err);
            }

            if(result.length > 0){
                return res.json({ message: 'This username is taken.' });
            }

            const findUserQuery = "update users set username = ? where id = ?";
            db.query(findUserQuery, [value, req.session.userId], (err, result) => {
                if(err){
                    console.error("error finding email form DB: ", err);
                    return res.json({ message: 'Something went wrong, try again.' });
                }

                return res.json({ message: 'success' });
            });
        });   
    } else if(data.ui == "email" || data.ui == "password"){
        db.query("select * from users where email = ?", [value], (err, result) => {
            if(err){
                console.error("Error checking email exists: " + err);
            }

            if(data.ui == "email"){
                if(!isValidEmail(value)){
                    return res.json({ message: 'Please enter a valid email.' });
                }
                if(result.length > 0){
                    return res.json({ message: 'This email is taken.' });
                }
            } else {
                if(value.length < 5){
                    return res.json({ message: 'Enter a longer password.' });
                }
            }

            db.query("select * from users where id = ?", [req.session.userId], (err, result) => {
                if(err){
                    console.error(err);
                }

                if(result.length == 0){
                    return res.json({ message: 'id not found' });
                }

                let userEmail = result[0].email;

                bcrypt.hash(value, 10, (err, hashedValue) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return res.status(500).send('Error hashing password');
                    }
                    let realValue = hashedValue;
                    if(data.ui == "email"){
                        realValue = value;
                    }

                    const codeQuery = "insert into change_codes (user_id, setting_type, value_str, verification_code) values (?, ?, ?, ?)";
                    db.query(codeQuery, [result[0].id, data.db, realValue, code], (err, result) => {
                        if(err){console.error(err)}

                        
                        sendVerificationEmail(userEmail, code);
                        return res.json({ message: 'verify' });
                    });
                });
            });
        });
    } 
});

app.post("/api/settings-verify", (req, res) => {
    const enteredCode = req.body.code;

    db.query("select * from change_codes where user_id = ? and verification_code = ?", [req.session.userId, enteredCode], (err, result) => {
        if(err){console.error(err)}

        if(result.length == 0){
            return res.json({ message: 'code not found..' });
        }
        
        if(result[0].verification_code == enteredCode){
            let newValue = result[0].value_str;
            const updateValueQuery = `update users set ${result[0].setting_type} = ? where id = ?`;
            db.query(updateValueQuery, [newValue, req.session.userId], (err, result) => {
                if(err){
                    console.error(err);
                }

                db.query("delete from change_codes where user_id = ?", [userId], (err, result) => {         
                    if(err){
                        console.error(err);
                    }
                    
                    return res.json({ message: 'success' });
                });
            });
        } else {
            return res.json({ message: 'incorrect' });
        }
    });
});

app.get("/api/delete-account", (req, res) => {
    db.query("delete from users where id = ?", [req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        req.session.destroy(err => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: 'failed' });
            }
            return res.json({ message: 'success' });
        });
    });
});

app.post("/api/update-level", (req, res) => {
    const { id, levelIdx } = req.body;

    let newLevel = "hl";
    if(levelIdx == 1){
        newLevel = "ol";
    }

    const updateLevelQuery = "update subjects set level = ? where id = ?";
    db.query(updateLevelQuery, [newLevel, id], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success' });
    });
});

app.post("/api/remove-subject", (req, res) => {
    const id = req.body.id;

    db.query("delete from subjects where id = ?", [id], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success' });
    });
});

app.post("/api/toggle-complete", checkLogged, (req, res) => {
    const id = req.body.id;
    const change = req.body.change;

    db.query("select * from completed_questions where image_id = ? and user_id = ?", [id, req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        if(result.length == 0){
            db.query("insert into completed_questions (image_id, user_id, completed) values (?, ?, ?)", [id, req.session.userId, "true"], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        } else {
            db.query("update completed_questions set completed = ? where image_id = ?", [change, id], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        }
    });
});

app.post("/api/toggle-save", checkLogged, (req, res) => {
    const id = req.body.id;
    const change = req.body.change;

    db.query("select * from saved_questions where image_id = ? and user_id = ?", [id, req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        if(result.length == 0){
            db.query("insert into saved_questions (image_id, user_id, saved) values (?, ?, ?)", [id, req.session.userId, "true"], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        } else {
            db.query("update saved_questions set saved = ? where image_id = ?", [change, id], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        }
    });
});

app.post("/api/question-data", checkLogged, (req, res) => {
    const id = req.body.id;

    db.query("select * from completed_questions where image_id = ?", [id], (err, result) => {
        if(err){
            console.error(err);
        }

        let isComplete = "false";
        if(result.length > 0 && result[0].completed == "true"){
            isComplete = "true";
        }

        db.query("select * from saved_questions where image_id = ?", [id], (err, result) => {
            if(err){
                console.error(err);
            }

            let isSaved = "false";
            if(result.length > 0 && result[0].saved == "true"){
                isSaved = "true";
            }

            return res.json({ message: 'success', completed: isComplete, saved: isSaved });
        });
    });
});

app.get("/api/get-saved", checkLogged, (req, res) => {
    let imageIds = [];
    db.query("select * from saved_questions where user_id = ? and saved = ?", [req.session.userId, "true"], (err, result) => {
        if(err){
            console.error(err);
        }

        if(result.length == 0){
            return res.json({ message: 'nothing saved' });
        }

        result.forEach(row => {
            imageIds.push(row.image_id);
        });
        db.query("select * from new_images where id in (?)", [imageIds], (err, result) => {
            if(err){
                console.log(err);
            }

            let originalImages = result;
            let savedTopics = [];
            result.forEach(row => {
                savedTopics.push(row.topic);
            });
            db.query("select * from new_images where topic in (?)", [savedTopics], (err, result) => {
                if(err){
                    console.error(err);
                }

                let imageSrcs = [];
                let schemeSrcs = [];
                originalImages.forEach(originalImg => {
                    let currentQuestion = [originalImg];
                    let currentSrcs = [];
                    let currentScheme = [];
                    let currentSchemeSrcs = [];
                    result.forEach(row => {
                        if(row.id != originalImg.id && row.year == originalImg.year && row.level == originalImg.level && row.option == originalImg.option && row.part == originalImg.part && row.question == originalImg.question && row.type == originalImg.type && row.version == originalImg.version && row.question_id == originalImg.question_id){
                            currentQuestion.push(row);
                        }

                        if(row.year == originalImg.year && row.level == originalImg.level && row.option == originalImg.option && row.part == originalImg.part && row.question == originalImg.question && row.type == originalImg.type && row.version != originalImg.version && row.question_id == originalImg.question_id){
                            currentScheme.push(row);
                        }
                    });
                    for(let i = 1; i <= currentQuestion.length; i++){
                        currentQuestion.forEach(row => {
                            if(row.layer == String(i)){
                                currentSrcs.push(row.url);
                            }
                        });
                    }
                    for(let i = 1; i <= currentScheme.length; i++){
                        currentScheme.forEach(row => {
                            if(row.layer == String(i)){
                                currentSchemeSrcs.push(row.url);
                            }
                        });
                    }
                    imageSrcs.push(currentSrcs);
                    schemeSrcs.push(currentSchemeSrcs);
                });

                return res.json({ message: 'success', questions: originalImages, srcs: imageSrcs, schemeSrcs: schemeSrcs });
            });

        });
    });
});

app.post("/api/delete-question", (req, res) => {
    const imageId = req.body.imageId;

    db.query("update saved_questions set saved = ? where image_id = ?", ["false", imageId], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success' });
    });
});

app.post("/api/worksheet-questions", (req, res) => {
    const { cert, subject, level, topic } = req.body;

    db.query("select * from new_images where certificate = ? and subject = ? and level = ? and slug = ?", [cert, subject, level, topic], (err, result) => {
        if(err){
            console.error(err);
        }

        if(result.length == 0){
            return res.json({ message: 'nothing found' });
        }

        return res.json({ message: 'success', questions: result });
    });
});

app.post("/api/save-sheet", checkLogged, (req, res) => {
    let { html, title, subject, level, cert, date, questionData, schemeData, sheetId, isNew } = req.body;
    if(title == "") title = "Unnamed Worksheet";
    schemeData = schemeData.join(",,"); // "a,b,,c,d,,e"
    questionData = questionData.join(",,");

    if(isNew){
        db.query("insert into saved_sheets (user_id, html, title, subject, level, certificate, last_edited, question_data, scheme_data, save_status) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.session.userId, html, title, subject, level, cert, date, questionData, schemeData, "true"], (err, result) => {
            if(err){
                console.error(err);
            }
            
            return res.json({ message: 'success', newId: result.insertId });
        });
    } else {
        db.query("update saved_sheets set html = ?, title = ?, subject = ?, level = ?, certificate = ?, last_edited = ?, question_data = ?, scheme_data = ?, save_status = ? where id = ? and user_id = ?", [html, title, subject, level, cert, date, questionData, schemeData, "true", sheetId, req.session.userId], (err, result) => {
            if(err){
                console.error(err);
            }

            return res.json({ message: 'success' });
        });
    }
});

app.get("/api/get-sheets", checkLogged, (req, res) => {
    db.query("select * from saved_sheets where user_id = ? and save_status = ?", [req.session.userId, "true"], (err, result) => {
        if(err){
            console.error(err);
        } 

        if(result.length == 0){
            return res.json({ message: 'no sheets' });
        }

        return res.json({ message: 'success', sheets: result });
    });
});

app.post("/api/delete-sheet", (req, res) => {
    const sheetId = req.body.sheetId;

    db.query("delete from saved_sheets where id = ? and user_id = ?", [sheetId, req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success' });
    });
});

app.post("/api/display-sheet", (req, res) => {
    db.query("select * from saved_sheets where id = ?", [req.body.sheetId], (err, result) => {
        if(err){
            console.error(err);
        }

        if(!result[0] || (req.session.userId && req.session.userId != result[0].user_id)){
            return res.json({ message: 'not found' });
        }

        if(!req.session.userId){
            return res.json({ message: 'success', sheetData: result[0], userType: "guest" });
        }

        return res.json({ message: 'success', sheetData: result[0], userType: "logged" });
    });
});

app.post("/api/print-question", (req, res) => {
    const { questionImgs, schemeImgs } = req.body;
    let questionData = questionImgs.join(",");
    let schemeData = schemeImgs.join(",");
    console.log(req.body);

    let userId = req.session.userId;
    if(!req.session.userId){
        userId = null;
    }

    db.query("insert into saved_sheets (user_id, question_data, scheme_data, save_status) values (?, ?, ?, ?)", [userId, questionData, schemeData, "false"], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success', sheetId: result.insertId });
    });
});

app.post("/api/save-quiz", (req, res) => {
    const { html, subject, topic, date, score } = req.body;

    if(!req.session.userId) return res.json({ message: 'success' });

    db.query("insert into saved_quizzes (user_id, html, subject, topic, date_taken, score) values (?, ?, ?, ?, ?, ?)", [req.session.userId, html, subject, topic, date, score], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success' });
    });
});

app.get("/api/get-results", (req, res) => {
    db.query("select * from saved_quizzes where user_id = ?", [req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success', results: result });
    });  
});

app.get("/api/papers/:certificate/:subject/:level", (req, res) => {
    const { certificate, subject, level } = req.params;
    let certText = "lc";
    if(certificate == "junior-certificate") certText = "jc";

    db.query("select * from papers where certificate = ? and subject = ? order by id asc", [certText, subject], (err, result) => {
        if(err){
            console.error(err);
        }

        let papers = result;
        if(level != "cl") papers = papers.filter(obj => obj.level == level);

        if(!req.session.userId){
            return res.json({ message: 'success', papers: result });
        }

        db.query("select * from completed_papers where user_id = ?", [req.session.userId], (err, result) => {
            if(err){
                console.error(err);
            }

            return res.json({ message: 'success', papers: papers, completed: result });
        });
    });
});

app.post("/api/paper-complete", (req, res) => {
    const id = req.body.id;
    const change = req.body.change;

    if(!req.session.userId){
        return res.json({ message: 'success' });
    }

    db.query("select * from completed_papers where paper_id = ? and user_id = ?", [id, req.session.userId], (err, result) => {
        if(err){
            console.error(err);
        }

        if(result.length == 0){
            db.query("insert into completed_papers (paper_id, user_id, completed) values (?, ?, ?)", [id, req.session.userId, "true"], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        } else {
            db.query("update completed_papers set completed = ? where paper_id = ?", [change, id], (err, result) => {
                if(err){
                    console.error(err);
                }

                return res.json({ message: 'success' });
            });
        }
    });
});

app.post("/api/single-paper", (req, res) => {
    const questionData = req.body.questionData;

    db.query("select * from papers where year = ? and subject = ? and level = ? and type = ? and version = ? and certificate = ?", [questionData.year, questionData.subject, questionData.level, questionData.type, questionData.version.slice(0, 1), questionData.certificate], (err, result) => {
        if(err){
            console.error(err);
        }

        return res.json({ message: 'success', url: result[0].url });
    });
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});