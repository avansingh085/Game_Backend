const Users = require('../Schema/UsersSchema.js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "ababba";

const generateToken = async (_id) => {
  return jwt.sign({ _id }, JWT_SECRET, { expiresIn: '30m' });
};

const verifyToken = async (req, res, next) => {
  try {
    let { token } = req.body;
    if (!token) {
      return res.status(401).send({ success: false, result: "Token is missing" });
    }
    const decoded = await jwt.verify(token, JWT_SECRET);
    req._id = decoded._id;
    next();
  } catch (err) {
    return res.status(401).send({ success: false, result: "Internal server error" });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    if (!username || !email || !password) {
      return res.status(401).send({ success: false, result: "Invalid email or password" });
    }
    
    let isExistUser = await Users.findOne({ email });
    if (isExistUser) {
      return res.status(500).send({ success: false, result: "User already exists" });
    }
    
    let user = await Users.create({ username, password, email });
    return res.status(200).send({ success: true, token: await generateToken(user._id), result: "Successfully registered" });
    
  } catch (err) {
    return res.status(400).send({ success: false, result: "Internal server error" });
  }
};

const login = async (req, res) => {
  console.log("OPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
  try {
    
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ success: false, result: "Please fill all required details" });
    }
    
    let user = await Users.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).send({ success: false, result: "Invalid email or password" });
    }
    
    return res.status(200).send({ success: true, result: "Successfully logged in", token: await generateToken(user._id) });
    
  } catch (err) {
    return res.status(500).send({ success: false, result: "Internal server error" });
  }
};

module.exports = { login, register, verifyToken };
