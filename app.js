const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session =require("express-session");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: true,
    })
);

//database user
const users = [
  {username: "adminHR", password: "admin123", department: 'HR', role: "Admin", clearanceLevel: 3, seniority: 5},
  {username: "staffIT", password: "it123", department: 'IT', role: 'Staff', clearanceLevel: 1, seniority: 2 },
  {username: "managerFinance", password: "mfinance123", department: 'Finance', role: 'Manager', clearanceLevel: 2, seniority: 7},
  {username: "directorLegal", password: "legal123", department: 'Legal', role: 'Director', clearanceLevel: 3, seniority: 10},
  {username: "staffOps", password: "ops123", department: 'Operations', role: 'Staff', clearanceLevel: 1, seniority: 1},
  {username: "managerHR", password: "hr123", department: 'HR', role: 'Manager', clearanceLevel: 2, seniority: 8},
  {username: "staffFinance", password: "sf123", department: 'Finance', role: 'Staff', clearanceLevel: 1, seniority: 3},
];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = users.find(
    (u) => u.username == username && u.password == password
  );

  if (user) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect("/dashboard");
  } else {
    res.send("Invalid username or password");
  }
});

app.get("/dashboard", isUserLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/admin", isUserLoggedIn, isUserRoleMatch(["Admin"]), (req, res) => {
    res.send('Welcome admin!');
});

app.get("/hr-department", isUserLoggedIn, isAttributeMatch((user) => user.department === "HR"), (req, res) => {
    res.send("Welcome to the HR Department!");
});

// Rute Manager Finance (/finance-manager)
app.get("/finance-manager", isUserLoggedIn, isAttributeMatch((user) => user.department === "Finance" && user.role === "Manager" && user.seniority >= 5), (req, res) => {
    res.send("Welcome Finance Manager with 5+ years of experience!");
});

// Rute IT dengan Tingkat Keamanan (/it-clearance-2)
app.get("/it-clearance-2", isUserLoggedIn, isAttributeMatch((user) => user.department === "IT" && user.clearanceLevel >= 2), (req, res) => {
    res.send("Welcome IT staff with clearance level 2 or above!");
});

// Rute Director Legal (/legal-director)
app.get("/legal-director", isUserLoggedIn, isAttributeMatch((user) => user.department === "Legal" && user.role === "Director" && user.clearanceLevel === 3), (req, res) => {
    res.send("Welcome Legal Director with clearance level 3!");
});

// Rute Ops dengan Kontrol Akses Gabungan (/ops-combined)
app.get("/ops-combined", isUserLoggedIn, isAttributeMatch((user) => user.department === "Operations" && user.role === "Staff" && user.clearanceLevel === 1 && user.seniority < 3), (req, res) => {
    res.send("Welcome Operations staff with clearance level 1 and less than 3 years of experience!");
});

// Rute Eksekutif dengan Tingkat Keamanan Tinggi (/exec-clearance-3)
app.get("/exec-clearance-3", isUserLoggedIn, isAttributeMatch((user) => user.clearanceLevel === 3 && (user.role === "Manager" || user.role === "Director") && user.seniority >= 7), (req, res) => {
    res.send("Welcome Executive with high security clearance!");
});




app.get("/logout", isUserLoggedIn, (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// middleware functions
function isUserLoggedIn (req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect("/");
    }
}

function isUserRoleMatch(roles) {
    return (req, res, next) => {
        if (roles.includes(req.session.user.role)) {
            next();
        }else {
            res.send("Unauthorized Access !!!");
        }
    }
}

function isAttributeMatch(condition) {
    return (req, res, next) => {
        if (condition(req.session.user)) {
            next();
        }else {
            res.send("Unautorized Access !!!");
        }
    }
}