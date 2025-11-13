let subWrapper = document.querySelectorAll(".sub-wrapper");
let subDrop = document.querySelectorAll(".sub-drop");

let isPapDropped = false;
let isSortDropped = false;
let isPopDropped = false;
let isRemembered = false;
let isFirstImg = true;
let isTypePicked;
let isLevelPicked;
let isSubjectPicked;
let postFormProgress = [false, false, false];
let papType;
let papLevel;
let currentMode = "light";

let examChoose = "leaving-certificate";
let subjectChoose = "";
let levelChoose = "hl";
const backendUrl = "";
let display;
let subjectHtml = ["", ""];
let sheetQuestionImgs = [];
let sheetSchemeImgs = []; // [[urls], [urls]]
let sheetQuestionHtml;
let sheetSchemeHtml;
let sheetId;
let isSaved = false;

let settingsData = [
    {
        "ui": "username",
        "db": "username"
    },
    {
        "ui": "email",
        "db": "email"
    },
    {
        "ui": "password",
        "db": "password_hash"
    }
];
let settingsIdx = 0;

let params = new URLSearchParams(window.location.search);
const path = window.location.pathname;
const parts = path.slice(1).split("/");

let url = ""; // https://api.poojasbeautysalon.com   backend routes
let frontendLink = "";
if(window.location.href.includes("localhost")) {
    url = ""; // https://api.poojasbeautysalon.com   backend routes
    frontendLink = "http://localhost:3000"; // https://poojasbeautysalon.com   http://localhost:3000
} else {
    url = "https://www.exam-scope.com"; // https://api.poojasbeautysalon.com   backend routes
    frontendLink = "https://www.exam-scope.com"; // https://poojasbeautysalon.com   http://localhost:3000
}


if(!document.querySelector(".log-container") && !document.querySelector(".sign-container")){
    createHtml();
}

async function getDisplay(){
    try {
        const response = await fetch(`${url}/api/is-guest`, {
            method: 'GET',
            
        });
        const data = await response.json(); 
        const userData = data.userData;
        const subjectData = data.subjects;
        const theme = data.theme;

        /*
        if(theme == "dark"){
            currentMode = "light";
        } else if(theme == "light"){
            currentMode = "dark";
        }
        toggleMode();
        */

        if(data.message == "guest"){
            document.querySelectorAll(".logged-element").forEach(element => element.style.display = "none");
        } else if(data.message == "logged"){
            document.querySelectorAll(".guest-element").forEach(element => element.style.display = "none");
            document.getElementById("pfpName").textContent = data.userData.student_name;
            document.getElementById("pfpEmail").textContent = data.userData.email;
            if(document.querySelector(".sub-container")){
                subjectData.forEach(subject => {
                    let newWrapper = document.createElement("div");
                    newWrapper.classList.add("sub-wrapper");
                    let cert = "leaving-certificate";
                    if(subject.certificate_type == "jc"){
                        cert = "junior-certificate";
                    }
                    newWrapper.onclick = () => {
                        window.location.href = "topics/" + cert + "/" + subject.subject_name + "/" + subject.level;
                    };
                    let subjectSlug = subject.subject_name.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                    subjectSlug = (SubjectShort(subjectSlug));
                    let level = "Higher Level";
                    if(subject.level == "ol"){
                        level = "Ordinary Level";
                    } else if(subject.level == "cl"){
                        level = "Common Level";
                    }
                    newWrapper.innerHTML = `
                            <div class="sub-dot-container">
                                <div class="sub-dot"></div>
                                <div class="sub-dot"></div>
                                <div class="sub-dot"></div>
    
                                <div class="sub-drop">
                                    <div class="sub-drop-section">
                                        <div class="sub-drop-box"><i class="fa-solid fa-check sub-drop-check"></i></div>
                                        <div class="sub-drop-txt">Higher level</div>
                                    </div>
                                    <div class="sub-drop-section">
                                        <div class="sub-drop-box"><i class="fa-solid fa-check sub-drop-check"></i></div>
                                        <div class="sub-drop-txt">Ordinary level</div>
                                    </div>
                                    <div class="sub-drop-hr"></div>
                                    <a href="/settings?section=subjects&edit=true" class="sub-drop-section">
                                        <i class="fa-solid fa-pen-to-square sub-drop-icon"></i>
                                        <div class="sub-drop-txt">Edit Subjects</div>
                                    </a>
                                    <a href="/settings?section=subjects" class="sub-drop-section">
                                        <i class="fa-solid fa-book sub-drop-icon"></i>
                                        <div class="sub-drop-txt">All Subjects</div>
                                    </a>
                                </div>
                            </div>
    
                            <div class="sub-icon-container">
                                <img src="images/icons/${subject.subject_name}.png" alt="Subject Icon" class="sub-icon" />
                            </div>
                            <div class="sub-content">
                                <div class="sub-name">${subjectSlug}</div>
                                <div class="sub-point"></div>
                                <div class="sub-stat">${level}</div>
                            </div>
                    `;
                    dynamicLightMode(newWrapper);
                    if(subject.level == "hl"){
                        newWrapper.querySelectorAll(".sub-drop-box")[0].classList.add("sub-drop-box-active");
                        newWrapper.querySelectorAll(".sub-drop-check")[0].classList.add("sub-drop-check-active");
                    } else if(subject.level == "ol"){
                        newWrapper.querySelectorAll(".sub-drop-box")[1].classList.add("sub-drop-box-active");
                        newWrapper.querySelectorAll(".sub-drop-check")[1].classList.add("sub-drop-check-active");
                    } else {
                        newWrapper.querySelector(".sub-drop").innerHTML = `
                            <a href="/settings?section=subjects&edit=true" class="sub-drop-section">
                                <i class="fa-solid fa-pen-to-square sub-drop-icon"></i>
                                <div class="sub-drop-txt">Edit Subjects</div>
                            </a>
                            <a href="/settings?section=subjects" class="sub-drop-section">
                                <i class="fa-solid fa-book sub-drop-icon"></i>
                                <div class="sub-drop-txt">All Subjects</div>
                            </a>
                        `;
                    }
                    newWrapper.querySelectorAll(".sub-drop-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {if(!box.classList.contains("sub-drop-box-active")){
                            newWrapper.querySelectorAll(".sub-drop-box").forEach(other => {
                                other.classList.remove("sub-drop-box-active");
                                other.querySelector(".sub-drop-check").classList.remove("sub-drop-check-active");
                            });
                            box.classList.add("sub-drop-box-active");
                            box.querySelector(".sub-drop-check").classList.add("sub-drop-check-active");
                            newWrapper.querySelector(".sub-stat").textContent = "Higher Level";
                            let newLevel = "hl";
                            if(idx == 1){
                                newLevel = "ol";
                                newWrapper.querySelector(".sub-stat").textContent = "Ordinary Level";
                            }
                            newWrapper.onclick = () => {
                                window.location.href = "topics/" + cert + "/" + subject.subject_name + "/" + newLevel;
                            }
                            async function updateLevel() {
                                const dataToSend = { id: subject.id, levelIdx: idx };
                                try {
                                    const response = await fetch( url + '/api/update-level', {
                                        method: 'POST',
                                        
                                        headers: {
                                            'Content-Type': 'application/json', 
                                        },
                                        body: JSON.stringify(dataToSend), 
                                    });
    
                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('Error:', errorData.message);
                                        return;
                                    }
    
                                    const data = await response.json();
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                }
                            }
                            updateLevel();
                        }});
                    });
                    document.addEventListener("click", (e) => {
                        document.querySelectorAll(".sub-drop").forEach(cont => {
                            if(cont && !cont.contains(e.target) && cont.style.opacity == "1"){
                                cont.style.opacity = "0";
                                cont.style.pointerEvents = "none";
                            }
                        });
                    });
                    document.querySelector(".sub-flex").appendChild(newWrapper);
                });
                document.querySelectorAll(".sub-dot-container").forEach((cont, idx) => {
                    cont.addEventListener("mouseenter", () => {
                        cont.querySelectorAll(".sub-dot").forEach(dot => {
                            dot.style.backgroundColor = "hsl(145, 15%, 35%)";
                        });
                    });
                    cont.addEventListener("mouseleave", () => {
                        cont.querySelectorAll(".sub-dot").forEach(dot => {
                            dot.style.backgroundColor = "hsl(145, 15%, 55%)";
                        });
                    });
                    cont.addEventListener("click", (e) => {
                        e.stopPropagation();
                        document.querySelectorAll(".sub-drop")[idx].style.pointerEvents = "auto";
                        document.querySelectorAll(".sub-drop")[idx].style.opacity = "1";
                    });
                });
                document.querySelectorAll(".sub-drop").forEach(cont => {
                    cont.querySelectorAll(".sub-drop-box").forEach(box => {
                        box.addEventListener("click", () => {
                            cont.querySelectorAll(".sub-drop-box").forEach(old => {
                                old.classList.remove("sub-drop-box-active");
                                old.querySelector(".sub-drop-check").classList.remove("sub-drop-check-active");
                            });
                            box.classList.add("sub-drop-box-active");
                            box.querySelector(".sub-drop-check").classList.add("sub-drop-check-active");
                        });
                    });
                });
            }
        } else if(data.message == "not onboarded"){
            window.location.href = "/sign-up?onboarding=true&section=profile";
        } 

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function createHtml(){
    let footer = document.createElement("div");
    footer.classList.add("foot-container");
    footer.innerHTML = `
        <div class="foot-wrapper">
            <div class="foot-flex">
                <div class="foot-content">
                    <div class="foot-logo-container">
                        <img src="/images/icons/favicon.png" class="foot-logo" />
                        <div class="foot-name">ExamScope</div>
                    </div>
                    <div class="foot-para">Master your exams with quick, organised access to past questions, marking schemes, and focused tools.</div>
                    <div class="foot-social">
                        <i class="fa-brands fa-tiktok foot-social-icon"></i>
                        <i class="fa-brands fa-instagram foot-social-icon"></i>
                        <i class="fa-brands fa-facebook-f foot-social-icon"></i>
                        <i class="fa-brands fa-x-twitter foot-social-icon"></i>
                    </div>
                </div>
                <div class="foot-nav">
                    <div class="foot-ul">
                        <div class="foot-label">Company</div>
                        <a href="/welcome" class="foot-link">About us</a>
                        <a href="/welcome#features" class="foot-link">Features</a>
                        <a href="/welcome#faqs" class="foot-link">FAQs</a>
                        <a href="/welcome#contact" class="foot-link">Contact us</a>
                    </div>
                    <div class="foot-ul">
                        <div class="foot-label">My Resources</div>
                        <a href="/saved-questions" class="foot-link">Saved questions</a>
                        <a href="/my-results" class="foot-link">Quiz results</a>
                        <a href="/saved-sheets" class="foot-link">My Worksheets</a>
                        <a href="/settings" class="foot-link">My Account</a>
                    </div>
                    <div class="foot-ul">
                        <div class="foot-label">Tools</div>
                        <a href="/" class="foot-link">Exam questions</a>
                        <a href="/" class="foot-link">Take a quiz</a>
                        <a href="/past-papers" class="foot-link">Past papers</a>
                        <a href="/worksheet-builder" class="foot-link">Worksheet builder</a>
                    </div>
                </div>
            </div>
            <div class="foot-bottom">
                <div class="foot-copy">©2025 ExamScope. All rights reserved.</div>
                <div class="foot-legal">
                    <a href="/privacy-policy" class="foot-legal-link">Privacy Policy</a>
                    <a href="/terms-of-use" class="foot-legal-link">Terms of Service</a>
                </div>
            </div>
        </div>
    `
    if(document.querySelector("script")){
        document.body.insertBefore(footer, document.body.querySelector("script"));
    }

    let headerContainer = document.createElement("div");
    headerContainer.classList.add("header-container");
    headerContainer.innerHTML = `
        <div class="header">
            <a href="/" class="header-group">
                <img src="/images/icons/favicon.png" class="header-logo" />
                <div class="header-name">ExamScope</div>
            </a>
            <!-- 
                <div class="header-search-wrapper">
                    <input type="text" class="header-inp" placeholder="Search for anything..." />
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                </div>
             -->

             <div class="header-nav">
                <a href="/" class="header-link">Home</a>
                <a href="/welcome" class="header-link">About us</a>
                <a href="/welcome#features" class="header-link">Features</a>
                <a href="/welcome#faqs" class="header-link">FAQs</a>
                <a href="/welcome#contact" class="header-link">Contact us</a>
             </div>

            <div class="header-group header-logged-nav logged-element">
                <a href="/welcome#contact" class="btn-upgrade">
                    <div class="upgrade-txt">Feedback</div>
                    <i class="fa-solid fa-envelope upgrade-icon"></i>
                </a>
                <div class="pfp-container" onclick="dropProfile()">
                    <div class="pfp-bg"></div>
                    <i class="fa-solid fa-user pfp-user"></i>
                </div>

                <div class="pfp-drop">
                    <div class="pfp-drop-name" id="pfpName">Owen Marceau</div>
                    <div class="pfp-drop-email" id="pfpEmail">marceauowenser@gmail.com</div>
                    <div class="pfp-drop-hr"></div>
                    <a href="/settings" class="pfp-drop-section">
                        <i class="fa-solid fa-gear pfp-drop-icon"></i>
                        <div class="pfp-drop-txt">Settings</div>
                    </a>
                    <a href="/welcome" class="pfp-drop-section">
                        <i class="fa-solid fa-graduation-cap pfp-drop-icon"></i>
                        <div class="pfp-drop-txt">About us</div>
                    </a>
                    <a href="/welcome#contact" class="pfp-drop-section">
                        <i class="fa-solid fa-circle-question pfp-drop-icon"></i>
                        <div class="pfp-drop-txt">Help Centre</div>
                    </a>
                    <div class="pfp-drop-hr"></div>
                    <div class="pfp-drop-section" onclick="logoutClick()">
                        <i class="fa-solid fa-right-from-bracket pfp-drop-icon"></i>
                        <div class="pfp-drop-txt">Log Out</div>
                    </div>
                </div>
            </div>

            <div class="header-group header-guest-nav guest-element">
                <a href="/sign-up?onboarding=false" class="btn-header-guest btn-create">Join Now <i class="fa-solid fa-plus header-plus"></i></a>
                <a href="/login" class="btn-header-guest btn-login">Log In</a>
            </div>

            <div class="header-burger" onclick="toggleMenu()">
                <div class="burger-line line1"></div>
                <div class="burger-line line2"></div>
                <div class="burger-line line3"></div>
            </div>
        </div>
    `

    let pageShadow = document.createElement("div");
    pageShadow.classList.add("page-shadow");
    pageShadow.onclick = closeSideNav;

    let sideNav = document.createElement("div");
    sideNav.classList.add("side-nav");
    sideNav.innerHTML = `
        <a href="/" class="side-section">
            <i class="fa-solid fa-house side-icon"></i>
            <div class="side-txt">Home</div>
        </a>
        <div class="side-section library-section" onclick="dropSide('library')">
            <i class="fa-solid fa-folder-open side-icon"></i>
            <div class="side-txt">My Resources</div>

            <div class="side-drop">
                <a href="/my-results" class="side-drop-section">
                    <i class="fa-solid fa-chart-simple side-drop-icon"></i>
                    <div class="side-drop-txt">Quiz Results</div>
                </a>
                <a href="/papers" class="side-drop-section">
                    <i class="fa-solid fa-file-invoice side-drop-icon"></i>
                    <div class="side-drop-txt">Past Papers</div>
                </a>
                <a href="/saved-questions" class="side-drop-section">
                    <i class="fa-solid fa-bookmark side-drop-icon"></i>
                    <div class="side-drop-txt">Saved Questions</div>
                </a>
                <a href="/saved-sheets" class="side-drop-section">
                    <i class="fa-solid fa-file-pen side-drop-icon"></i>
                    <div class="side-drop-txt">My Worksheets</div>
                </a>
            </div>
        </div>
        <div class="side-section mode-section" onclick="toggleMode()">
            <i class="fa-solid fa-moon side-icon side-moon"></i>
            <i class="fa-solid fa-lightbulb side-icon side-sun" style="display: none;"></i>
            <div class="side-txt">Dark Mode</div>
        </div>

        <div class="side-split"></div>

        <a href="/welcome#contact" class="side-section">
            <i class="fa-solid fa-circle-question side-icon"></i>
            <div class="side-txt">Help Centre</div>
        </a>
        <a href="/settings" class="side-section settings-section logged-element">
            <i class="fa-solid fa-gear side-icon"></i>
            <div class="side-txt">Settings</div>
        </a>
        <div class="side-section logout-section logged-element" onclick="logoutClick()">
            <i class="fa-solid fa-right-from-bracket side-icon"></i>
            <div class="side-txt">Log Out</div>
        </div>    
        <a href="/sign-up?onboarding=false" class="guest-element btn-sidebar-sign">Join Now <i class="fa-solid fa-plus side-plus"></i></a>  
        <a href="/login" class="guest-element btn-sidebar-log">Log in</a>  
    `

    if(document.querySelector(".home-nav")){
        document.querySelector(".home-nav").innerHTML = `
            <a href="/" class="nav-link">Exam Questions <div class="home-hr-fill"></div></a>
            <a href="/my-results" class="nav-link">Quiz Results <div class="home-hr-fill"></div></a>
            <a href="/papers" class="nav-link">Past Papers <div class="home-hr-fill"></div></a>
            <a href="/saved-questions" class="nav-link">Saved Questions <div class="home-hr-fill"></div></a>
            <a href="/worksheets" class="nav-link">Worksheet Builder <div class="home-hr-fill"></div></a>
        `;
        let navIdx = 0;
        if(document.querySelector(".sub-container")){
            navIdx = 0;
        } else if(document.querySelector(".res-container")){
            navIdx = 1;
        } else if(document.querySelector(".full-papers-table")){
            navIdx = 2;
        } else if(document.querySelector(".sav-container")){
            navIdx = 3;
        } else if(document.querySelector(".bld-container") || document.querySelector(".sash-table")){
            navIdx = 4;
        }
        document.querySelectorAll(".nav-link")[navIdx].classList.add("nav-link-active");
        document.querySelectorAll(".home-hr-fill")[navIdx].classList.add("hr-fill-active");
        const navScrolls = [0, 10, 135, 270, 350];
        document.querySelectorAll(".nav-link").forEach((link, idx) => {
            if(link.querySelector(".hr-fill-active")){
                document.querySelector(".home-nav").scrollLeft += navScrolls[idx];
            } else if(window.innerWidth > 1310){
                link.addEventListener("mouseenter", () => {
                    link.querySelector(".home-hr-fill").classList.add("hr-fill-active");
                });
                link.addEventListener("mouseleave", () => {
                    link.querySelector(".home-hr-fill").classList.remove("hr-fill-active");
                });
            }
        });
    }

    getDisplay();
    
    document.body.prepend(sideNav);
    document.body.prepend(pageShadow);
    document.body.prepend(headerContainer);

    if(localStorage.getItem("theme") == "dark"){
        currentMode = "light";
    } else {
        currentMode = "dark";
    }
    toggleMode();
}

let subContainer = document.querySelector(".sub-container");
let papContainer = document.querySelector(".pap-container");
let savContainer = document.querySelector(".sav-container");
let resContainer = document.querySelector(".res-container");
let topcContainer = document.querySelector(".topc-container");
let examContainer = document.querySelector(".exam-container");
let comContainer = document.querySelector(".com-container");
let homeTitle = document.querySelector(".home-title");
let homeHrFill = document.querySelector(".home-hr-fill");
let papSelector = document.querySelector(".pap-selector");
let papArrow = document.querySelector(".pap-chevron");
let papDropdown = document.getElementById("dropLc");
let comSort = document.querySelector(".com-sort");
let comDrop = document.querySelector(".com-drop");
let comChevron = document.querySelector(".com-chevron");
let btnPop = document.querySelector(".btn-pop");
let popChevron = document.querySelector(".pop-chevron");
let popDrop = document.querySelector(".pop-drop");
let popDropUl = document.querySelectorAll(".pop-drop-ul");
let popSubjectBox = document.querySelector(".pop-subject-box");
let popSubjectTxt = document.querySelector(".pop-subject-txt");
let previewSubject = document.querySelector(".preview-subject");
let sideSec = document.querySelectorAll(".side-section");
let sideDrop = document.querySelectorAll(".side-drop");
let pfpContainer = document.querySelector(".pfp-container");
let subDropBox = document.querySelectorAll(".sub-drop-box");
let subDropCheck = document.querySelectorAll(".sub-drop-check");
let toggleBars = document.querySelectorAll(".pap-toggle");

// Topic-&-Text - topic-and-text: .replace(/ /g, "-").replace(/&/g, "and").replace(/---/g, "-").replace(/--/g, "-").replace().replace(/,/g, "").replace(/\//g, "-").replace(/:/g, "").replace(/\?/g, "").replace(/\|/g, "").replace(/[#.+/'()]/g, "").toLowerCase()
// subject-name - Subject Name: .replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
// Subject Name - subject-name: toLowerCase().replace(/ /g, "-").replace(/[(&)]/g, "").replace("--", "-")


if(subContainer || papContainer || document.querySelector(".bld-container")){
    clickOption(".pap-option-type", "pap-active");
    clickOption(".pap-option-level", "pap-active");
    let fullSubject;

    if(subContainer){
        document.querySelectorAll(".side-section")[0].classList.add("active-section");
    }

    // PAST PAPER FORM FUNCTIONALITY //
    papSelector.addEventListener("click", () => {
        if(!isPapDropped){
            if(currentMode == "light") papSelector.style.border = "1px solid hsl(145, 65%, 45%)";
            papArrow.style.transform = "rotate(-180deg)";
            papDropdown.classList.add("pap-drop-open");
            papDropdown.classList.remove("pap-drop-closed");
            isPapDropped = true;
        } else {
            if(currentMode == "light") papSelector.style.border = "1px solid hsl(0, 0%, 60%)";
            papArrow.style.transform = "rotate(0deg)";
            papDropdown.classList.remove("pap-drop-open");
            papDropdown.classList.add("pap-drop-closed");
            isPapDropped = false;
        }
    });
    document.querySelectorAll(".pap-drop-txt").forEach(element => {
        element.addEventListener("click", () => {
            isSubjectPicked = true;
            checkFilterComplete();
            document.querySelector(".pap-txt").textContent = element.textContent;
            subjectChoose = element.textContent.toLowerCase().replace(/ /g, "-").replace(/[(&)]/g, "").replace("--", "-");

            if(!element.classList.contains("pap-drop-cl")){
                document.querySelector(".level-toggle").style.display = "block";
                levelChoose = "hl";
                document.querySelectorAll(".pap-toggle-white")[1].classList.add("toggle-start");
                document.querySelectorAll(".pap-toggle-white")[1].classList.remove("toggle-end");
            } else {
                document.querySelector(".level-toggle").style.display = "none";
                levelChoose = "cl";
            }
        });
    });
    toggleBars.forEach(bar => {
        let toggleOptions = bar.querySelectorAll(".pap-toggle-section");
        let toggleWhite = bar.querySelector(".pap-toggle-white");
        toggleOptions.forEach((option, idx) => {
            option.addEventListener("click", () => {
                if(idx == 0){
                    toggleWhite.classList.add("toggle-start");
                    toggleWhite.classList.remove("toggle-end");
                } else {
                    toggleWhite.classList.remove("toggle-start");
                    toggleWhite.classList.add("toggle-end");
                }

                if(option.textContent == "Leaving Cert" || option.textContent == "Junior Cert"){
                    document.querySelector(".btn-pap").classList.add("btn-pap-inactive");
                    isSubjectPicked = false;
                    document.querySelector(".pap-txt").textContent = "Subject";
                    papDropdown.classList.remove("pap-drop-open");
                    papDropdown.classList.add("pap-drop-closed");
                    levelChoose = "hl"
                    document.querySelectorAll(".pap-toggle-white")[1].classList.add("toggle-start");
                    document.querySelectorAll(".pap-toggle-white")[1].classList.remove("toggle-end");

                    if(option.textContent == "Leaving Cert"){
                        papDropdown = document.getElementById("dropLc");
                        examChoose = "leaving-certificate";
                    } else {
                        papDropdown = document.getElementById("dropJc");
                        examChoose = "junior-certificate";
                    }
                } else if(option.textContent == "Higher") {
                    levelChoose = "hl";
                } else if(option.textContent == "Ordinary") {
                    levelChoose = "ol";
                }
            });
        });
    });

    function checkFilterComplete(){
        if(isSubjectPicked){
            document.querySelector(".btn-pap, .btn-bld-form").classList.remove("btn-pap-inactive");
            if(document.querySelector(".sub-container")){
                document.querySelector(".btn-pap").addEventListener("click", () => {
                    window.location.href = `/topics/${examChoose}/${subjectChoose}/${levelChoose}`;
                });
            }
            if(document.querySelector(".full-papers-table")){
                document.querySelector(".btn-pap").addEventListener("click", () => {
                    window.location.href = `/papers/${examChoose}/${subjectChoose}/${levelChoose}`;
                });
            }
            if(document.querySelector(".btn-bld-form")){
                document.querySelector(".btn-bld-form").onclick = () => {
                    window.location.href = `/worksheets/${examChoose}/${subjectChoose}/${levelChoose}`;
                };
            }
        }
    }
    //////////////////////////////////
}

if(document.querySelector(".sav-container")){
    async function getSavedQuestions() {
        try {
            const response = await fetch(url + `/api/get-saved`, {
                method: 'GET',
            });
            const data = await response.json(); 
            const questions = data.questions;
            const srcs = data.srcs;
            const schemeSrcs = data.schemeSrcs;
            let stateCount = 0;
            let mockCount = 0;

            if(data.message == "success"){
                questions.forEach((question, idx) => {
                    let newBox = document.createElement("div");
                    newBox.classList.add("sav-box");
                    let questionStr = "";
                    if(question.question){
                        questionStr = " - Question " + question.question.slice(1);
                    }
                    let levelTxt = "Higher level";
                    if(question.level == "ol"){
                        levelTxt = "Ordinary level";
                    } else if(question.level == "cl"){
                        levelTxt = "Common level";
                    }
                    let questionType = "";
                    stateCount++;
                    if(question.type == "mock"){
                        stateCount--;
                        mockCount++;
                        questionType = " sav-type-mock";
                    }
                    let imgHtml = "";
                    srcs[idx].forEach(imgLink => {
                        imgHtml += `<img src="${imgLink}" alt="Exam Question" class="exam-question-img" />`
                    });
                    let schemeHtml = "";
                    schemeSrcs[idx].forEach(imgLink => {
                        schemeHtml += `<img src="${imgLink}" alt="Exam Question" class="exam-scheme-img" />`
                    });
                    newBox.innerHTML = `
                            <div class="sav-scheme-container" style="display: none;">
                                ${schemeHtml}
                            </div>
                            <div class="sav-img-container">
                                ${imgHtml}
                            </div>
                            <div class="sav-content">
                                <div class="sav-heads">
                                    <div class="sav-title">${question.subject}</div>
                                    <div class="sav-point"></div>
                                    <div class="sav-level">${levelTxt}</div>
                                </div>
                                <div class="sav-info">${question.year}${questionStr} - ${question.topic.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</div>
                                <div class="sav-type${questionType}">${question.type.slice(0, 1).toUpperCase() + question.type.slice(1)} exam</div>
                            </div>
                            <div class="sav-hr"></div>
                            <div class="sav-btn-flex">
                                <div class="btn-sav btn-remove">Remove</div>
                                <div class="btn-sav btn-show">Show Question</div>
                            </div>
                    `;
                    dynamicLightMode(newBox);
                    newBox.querySelector(".btn-remove").onclick = () => {
                        async function deleteQuestion() {
                            const dataToSend = { imageId: question.id };
                            console.log(question.id);
                            try {
                                const response = await fetch(url + '/api/delete-question', {
                                    method: 'POST',
                                    
                                    headers: {
                                        'Content-Type': 'application/json', 
                                    },
                                    body: JSON.stringify(dataToSend), 
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error('Error:', errorData.message);
                                    return;
                                }

                                const data = await response.json();
                                if(data.message == "success"){
                                    newBox.style.display = "none";
                                }
                            } catch (error) {
                                console.error('Error posting data:', error);
                            }
                        }
                        deleteQuestion();
                    }
                    newBox.querySelector(".btn-show").onclick = () => {
                        document.querySelector(".preview-title").textContent = newBox.querySelector(".sav-info").textContent;
                        if(newBox.querySelector(".sav-type").classList.contains("sav-type-mock")){
                            document.querySelector(".exam-type").classList.add("pap-type-mock");
                            document.querySelector(".exam-type").textContent = "Mock Exam";
                        } else {
                            document.querySelector(".exam-type").classList.remove("pap-type-mock");
                            document.querySelector(".exam-type").textContent = "State Exam";
                            if(question.type == "deferred") document.querySelector(".exam-type").textContent = "Deferred Exam";
                        }
                        document.querySelector(".exam-ques-container").innerHTML = newBox.querySelector(".sav-img-container").innerHTML;
                        document.querySelector(".scheme-img-container").innerHTML = newBox.querySelector(".sav-scheme-container").innerHTML;
                        document.querySelector(".preview-modal").style.opacity = "1";
                        document.querySelector(".preview-modal").style.pointerEvents = "auto";
                        scrollToTop(document.querySelector(".preview-wrapper"));
                        console.log("y");
                    }

                    document.querySelector(".sav-col").appendChild(newBox);
                });
                document.querySelectorAll(".filter-amount").forEach((el, idx) => {
                    if(idx == 0) el.textContent = "(" + String(stateCount + mockCount) + ")";
                    if(idx == 1) el.textContent = "(" + String(stateCount) + ")";
                    if(idx == 2) el.textContent = "(" + String(mockCount) + ")";
                });
            } else {
                document.querySelector(".sav-filter-container").style.display = "none";
                document.querySelector(".sav-col").style.display = "none";
                document.querySelector(".sav-empty").style.display = "flex";
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getSavedQuestions();

    document.querySelectorAll(".exam-filter-box").forEach((element, idx) => {
        element.addEventListener("click", () => {
            document.querySelectorAll(".exam-filter-box").forEach(el => {
                el.classList.remove("filter-box-active");
                el.querySelector("i").classList.remove("filter-check-active");
            });
            element.classList.add("filter-box-active");
            element.querySelector("i").classList.add("filter-check-active");

            if(idx == 0){
                document.querySelectorAll(".sav-box").forEach(box => {box.style.display = "block"})
            } else if(idx == 1){
                document.querySelectorAll(".sav-box").forEach(box => {
                    if(box.querySelector(".sav-type-mock")){
                        box.style.display = "none";
                    } else {
                        box.style.display = "block";
                    }
                });
            } else if(idx == 2){
                document.querySelectorAll(".sav-box").forEach(box => {
                    if(!box.querySelector(".sav-type-mock")){
                        box.style.display = "none";
                    } else {
                        box.style.display = "block";
                    }
                });
            }
        });
    });

    document.querySelector(".preview-modal").addEventListener("mousedown", (e) => {
        if(!document.querySelector(".preview-wrapper").contains(e.target)) {
            closePreviewModal();
        }
    });
    function closePreviewModal(){
        document.querySelector(".preview-modal").style.opacity = "0";
        document.querySelector(".preview-modal").style.pointerEvents = "none";
    }
    document.querySelector(".btn-view").onclick = () => {
        let autoHeight = 0;
        document.querySelector(".scheme-img-container").querySelectorAll(".exam-scheme-img").forEach(img => {
            autoHeight = autoHeight + img.clientHeight;
            console.log(img.clientHeight);
        });
        if(document.querySelector(".scheme-img-container").style.maxHeight.includes("calc")){
            document.querySelector(".exam-eye-open").style.display = "block";
            document.querySelector(".exam-eye-slash").style.display = "none";
            document.querySelector(".scheme-img-container").style.maxHeight = "0px";
            document.querySelector(".scheme-img-container").style.margin = "0";
        } else {
            document.querySelector(".exam-eye-open").style.display = "none";
            document.querySelector(".exam-eye-slash").style.display = "block";
            document.querySelector(".scheme-img-container").style.maxHeight = "calc(" + autoHeight + "px + 30px)";
            console.log("calc(" + autoHeight + "px + 30px)");
            document.querySelector(".scheme-img-container").style.margin = "15px 0";
        }
    }
}

if(papContainer){
    clickOption(".pap-box", "pap-box-active");

    const pathParts = window.location.pathname.split('/');
    const certificate = pathParts[2];
    const subject = pathParts[3];
    const level = pathParts[4];

    if(pathParts.length > 2){
        async function getPapers(){
            try {
                const response = await fetch(url + `/api/papers/${certificate}/${subject}/${level}`, {
                    method: 'GET',
                    
                });
                let subjectTitle = subject.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                subjectTitle = SubjectShort(subjectTitle);
                document.querySelector(".home-title").textContent = subjectTitle;
                makeTitle();
                const data = await response.json(); 
                const papers = data.papers;
                const completed = data.completed;
                let changeTo = "true";
                document.querySelector(".home-back").style.display = "flex";
                if(data.message == "success"){
                    document.querySelector(".pap-form").style.display = "none";
                    document.querySelector(".pap-table").style.display = "block";
                    let allRows = [];
                    let isCommon;
                    papers.forEach((paper, idx) => {if(paper.version == "q"){
                        if(idx == 0){
                            document.querySelector(".pap-container").style.display = "block";
                            document.querySelector(".sav-empty").style.display = "none";
                            papers.forEach(test => {
                                if(test.level == "cl"){
                                    isCommon = true;
                                }
                            });
                        }

                        let newRow = document.createElement("div");
                        newRow.classList.add("pap-row");
                        let paperPart = "";
                        if(paper.part != "no-part") paperPart = paper.part;
                        let levelStr = "";
                        if(paper.level == "hl" && isCommon){
                            levelStr = " (higher)";
                        } else if(paper.level == "ol" && isCommon){
                            levelStr = " (ordinary)";
                        }

                        let schemeUrl = "/not-found";
                        let schemeTarget = "style='opacity: 0; pointer-events: none;'";
                        papers.forEach(scheme => {
                            if(scheme.version == "m" && scheme.year == paper.year && scheme.subject == paper.subject && scheme.level == paper.level && scheme.type == paper.type && scheme.certificate == paper.certificate){
                                schemeUrl = scheme.url;
                                schemeTarget = "";
                            }
                        });

                        newRow.innerHTML = `
                            <div class="pap-year-col">
                                <div class="pap-m-type">${paperPart}${levelStr}</div>
                                <div class="pap-year">${paper.year}</div>
                            </div>
                            <div class="pap-type pap-type-${paper.type}">${paper.type.slice(0, 1).toUpperCase() + paper.type.slice(1)} Exam</div>
                            <a href="${paper.url}" target="_blank" class="pap-img-container">
                                <img src="/images/eg_paper.png" alt="Exam Paper" class="pap-img">
                            </a>
                            <a href="${schemeUrl}" target="_blank" class="pap-img-container" ${schemeTarget}>
                                <img src="/images/eg_scheme.png" alt="Exam Paper" class="pap-img">
                            </a>
                            <div class="pap-mark"><i class="fa-solid fa-check pap-check"></i></div>
                        `;
                        dynamicLightMode(newRow);
                        allRows.push([newRow, paper.group_id, Number(paper.layer.slice(1)), paper.part]);
                        //document.getElementById("papCol").appendChild(newRow);

                        if(completed){
                            completed.forEach(saveRow => {
                                if(saveRow.paper_id == paper.id && saveRow.completed == "true"){
                                    newRow.querySelector(".pap-mark").classList.add("pap-mark-active");
                                    newRow.querySelector(".pap-check").classList.add("pap-check-active");
                                    changeTo = "false";
                                }
                            });
                            newRow.querySelector(".pap-mark").addEventListener("click", () => {
                                async function toggleComplete() {
                                    const dataToSend = { id: paper.id, change: changeTo };
                                    try {
                                        const response = await fetch(url + '/api/paper-complete', {
                                            method: 'POST',
                                            
                                            headers: {
                                                'Content-Type': 'application/json', 
                                            },
                                            body: JSON.stringify(dataToSend), 
                                        });

                                        if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error('Error:', errorData.message);
                                            return;
                                        }

                                        const data = await response.json();
                                        if(changeTo == "true"){
                                            changeTo = "false";
                                        } else {
                                            changeTo = "true";
                                        }
                                    } catch (error) {
                                        console.error('Error posting data:', error);
                                    }
                                }
                                toggleComplete();
                            });
                        }
                    }});

                    if(papers.length == 0){
                        document.querySelector(".pap-container").style.display = "none";
                        document.querySelector(".sav-empty").style.display = "flex";
                    }

                    for(let i = 0; i < allRows.length; i++){
                        let row = allRows[i];
                        let matchFound = false;
                        allRows.forEach((other, otherIdx) => {
                            if(i != otherIdx && row[1] == other[1]){
                                matchFound = true;
                                if(row[2] < other[2]){
                                    document.getElementById("papCol").appendChild(row[0]);
                                    document.getElementById("papCol").appendChild(other[0]);
                                } else if(row[2] == other[2]){
                                    if(row[3] == "no-part"){
                                        document.getElementById("papCol").appendChild(row[0]);
                                        document.getElementById("papCol").appendChild(other[0]);
                                    } else {
                                        document.getElementById("papCol").appendChild(other[0]);
                                        document.getElementById("papCol").appendChild(row[0]);
                                    }
                                } else {
                                    document.getElementById("papCol").appendChild(other[0]);
                                    document.getElementById("papCol").appendChild(row[0]);
                                }
                            }
                        });
                        if(!matchFound){
                            document.getElementById("papCol").appendChild(row[0]);
                        }
                    }

                    document.querySelectorAll(".pap-mark").forEach(box => {
                        box.addEventListener("click", () => {
                            if(box.classList.contains("pap-mark-active")){
                                box.classList.remove("pap-mark-active");
                                box.querySelector(".pap-check").classList.remove("pap-check-active");
                            } else {
                                box.classList.add("pap-mark-active");
                                box.querySelector(".pap-check").classList.add("pap-check-active");
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        getPapers();
    } else {
        document.querySelector(".home-back").style.display = "none";
        document.querySelector(".pap-form").style.display = "block";
        document.querySelector(".pap-table").style.display = "none";
    }
}

if(resContainer){
    document.querySelector(".res-box").addEventListener("click", () => {
        document.querySelectorAll(".pap-row").forEach(box => box.style.display = "flex");
    });

    async function getQuizResults(){
        try {
            const response = await fetch(url + `/api/get-results`, {
                method: 'GET',
                
            });
            const data = await response.json(); 
            const results = data.results;
            document.querySelector(".res-all-box").textContent = "All (" + results.length + ")";
            results.forEach(result => {
                let newRow = document.createElement("div");
                newRow.classList.add("pap-row");
                let subjectSlug = SubjectShort(result.subject);
                newRow.innerHTML = `
                    <div class="res-txt res-subject">${subjectSlug}</div>
                    <div class="res-name">${result.topic}</div>
                    <div class="res-txt res-date">${result.date_taken}</div>
                    <div class="res-txt">Finished</div>
                    <div class="res-score">${result.score}</div>
                `;
                dynamicLightMode(newRow);
                
                document.querySelector(".res-inside").appendChild(newRow);

                newRow.querySelector(".res-name").onclick = () => {
                    document.querySelector(".ana-modal").innerHTML = result.html;
                    document.querySelector(".ana-modal").style.opacity = "1";
                    document.querySelector(".ana-modal").style.pointerEvents = "auto";
                    document.querySelector(".ana-modal").onclick = (e) => {
                        if(!document.querySelector(".ana-wrapper").contains(e.target)){
                            document.querySelector(".ana-modal").style.opacity = "0";
                            document.querySelector(".ana-modal").style.pointerEvents = "none";
                        }
                    }
                    document.querySelector("i.ana-close").onclick = () => {
                        document.querySelector(".ana-modal").style.opacity = "0";
                        document.querySelector(".ana-modal").style.pointerEvents = "none";
                    }
                }

                let subjectExist = false;
                document.querySelectorAll(".res-box").forEach(box => {
                    if(box.textContent.includes(result.subject)) subjectExist = true;
                });
                if(subjectExist){
                    document.querySelectorAll(".res-box").forEach(box => {
                        if(box.textContent.includes(result.subject)){
                            box.textContent = result.subject + " (" + String(Number(box.textContent.slice(box.textContent.lastIndexOf("(") + 1, box.textContent.lastIndexOf(")"))) + 1) + ")";
                        }
                    });
                } else {
                    let newOption = document.createElement("div");
                    newOption.classList.add("res-box");
                    newOption.textContent = result.subject + " (1)";
                    newOption.addEventListener("click", () => {
                        document.querySelectorAll(".pap-row").forEach(row => {
                            row.style.display = "none";
                            if(newOption.textContent.includes(row.querySelector(".res-subject").textContent)){
                                row.style.display = "flex";
                            }
                        });
                    });
                    dynamicLightMode(newOption);
                    document.querySelector(".res-box-container").appendChild(newOption);
                }
            });
            if(results.length == 0){
                document.querySelector(".res-container").style.display = "none";
                document.querySelector(".sav-empty").style.display = "flex";
            }
            clickOption(".res-box", "res-box-active");
            colourScores(); 
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getQuizResults();
}

if(comContainer){
    // POST INFO HOVERS //
        document.querySelectorAll(".post-info-txt").forEach(cont => {
            cont.addEventListener("mouseenter", () => {
                cont.style.color = "hsl(0, 0%, 54%)";
                cont.querySelector("i").style.color = "hsl(0, 0%, 54%)";
            });
            cont.addEventListener("mouseleave", () => {
                cont.style.color = "hsl(0, 0%, 34%)";
                cont.querySelector("i").style.color = "hsl(0, 0%, 34%)";
            });
        });
    //////////////////////

    // POST SORT TOGGLE //
    comSort.addEventListener("click", () => {
        if(!isSortDropped){
            comDrop.style.opacity = "1";
            comDrop.style.pointerEvents = "auto";
            comChevron.style.transform = "rotate(-180deg)";
            isSortDropped = true;
        } else {
            comDrop.style.opacity = "0";
            comDrop.style.pointerEvents = "none";
            comChevron.style.transform = "rotate(0deg)";
            isSortDropped = false;
        }
    });
    document.querySelectorAll(".com-drop-txt").forEach(section => {
        section.addEventListener("click", () => {
            document.querySelector(".com-box-txt").textContent = section.textContent;
        });
    });
    //////////////////////

    // POST PREVIEW DROPDOWN //
    popSubjectBox.addEventListener("click", () => {
        if(!isPopDropped){
            popChevron.style.transform = "rotate(0deg)";
            popDrop.style.opacity = "1";
            popDrop.style.pointerEvents = "auto";
            isPopDropped = true;
        } else {
            popChevron.style.transform = "rotate(-90deg)";
            popDrop.style.opacity = "0";
            popDrop.style.pointerEvents = "none";
            isPopDropped = false;
        }
    });
    document.querySelectorAll(".pop-drop-label").forEach((label, idx) => {
        let popDropChevron = label.querySelector(".pop-drop-chevron");
        popDropChevron.style.transform = "rotate(-90deg)";
        label.addEventListener("click", (e) => {
            e.stopPropagation();
            if(popDropChevron.style.transform == "rotate(-90deg)"){
                popDropChevron.style.transform = "rotate(0deg)";
                popDropUl[idx].style.display = "block";
            } else {
                popDropChevron.style.transform = "rotate(-90deg)";
                popDropUl[idx].style.display = "none";
            }
        });
    });
    popDropUl.forEach((ul, idx) => {
        ul.querySelectorAll(".pop-drop-li").forEach(li => {
            li.addEventListener("click", () => {
                if(li.textContent == "General"){
                    popSubjectTxt.textContent = document.querySelectorAll(".pop-drop-label")[idx].textContent.replace(/\s+/g, '');
                    previewSubject.textContent = document.querySelectorAll(".pop-drop-label")[idx].textContent.replace(/\s+/g, '');
                } else {
                    popSubjectTxt.textContent = li.textContent;
                    previewSubject.textContent = li.textContent;
                }
                checkForm();
            });
        });
    });
    function checkForm(){
        if(document.querySelector(".pop-subject-txt").textContent != "Subject/Topic" && document.querySelector(".pop-input").value.length > 0 && document.querySelector(".pop-area").value.length > 0){
            btnPop.style.opacity = "1"; 
            btnPop.style.pointerEvents = "auto";
        }
    }
    ///////////////////////////

    // POST PREVIEW UI LOGIC //
    updatePreview(".pop-input", ".preview-title", "Your Title");
    updatePreview(".pop-area", ".preview-para", "Your description goes here...");

    function updatePreview(inputClass, previewClass, placeholder){
        document.querySelector(inputClass).addEventListener("input", () => {
            let newValue = document.querySelector(inputClass).value;
            let previewElement = document.querySelector(previewClass);
            if(newValue.length > 0){
                previewElement.textContent = newValue;
            } else {
                previewElement.textContent = placeholder;
                btnPop.style.opacity = "0.5";
                btnPop.style.pointerEvents = "none";
            }
            checkForm();
        });
    }
    ///////////////////////////

    // OPEN/CLOSE MODALS //
    clickOutside(".com-pop-modal", ".com-pop");
    clickOutside(".com-rep-modal", ".com-rep");

    function openPop(className){
        let classNameEl = document.querySelector(className);
        classNameEl.style.opacity = "1";
        classNameEl.style.pointerEvents = "auto";
    }
    function closePop(className){
        let classNameEl = document.querySelector(className);
        classNameEl.style.opacity = "0";
        classNameEl.style.pointerEvents = "none";
    }
    function clickOutside(modal, wrapper){
        document.querySelector(modal).addEventListener("mousedown", (e) => {
            if(!document.querySelector(wrapper).contains(e.target)){
                closePop(modal);
            }
        });
    }
    //////////////////////
}

if(topcContainer){
    const pathParts = window.location.pathname.split('/');
    const certificate = pathParts[2];
    const subject = pathParts[3];
    const level = pathParts[4];
    let topics;

    makeTitle();

    // json file path
    certText = "lc";
    if(certificate == "junior-certificate"){
        certText = "jc";
    }

    let newCourse;
    fetch(`/topics/${certText}/${subject}/${level}/${subject}.json`) 
    .then(res => res.json())
    .then(data => {
        topics = data.topics;
        if(data.course && data.course == "old"){
            document.querySelector(".home-para").innerHTML = `This is the old ${subject} course (for current 6th years only). Click <a href="/topics/leaving-certificate/${subject}-new-course/hl" style="color: black; text-decoration: underline;">here</a> to find the new course.`;
        } else if(data.course && data.course == "new"){
            newCourse = true;
            document.querySelector(".home-para").innerHTML = `This is the new ${subject.replace("-new-course", "")} course (for everyone except 6th years). Click <a href="/topics/leaving-certificate/${subject.replace("-new-course", "")}/hl" style="color: black; text-decoration: underline;">here</a> to find the old course.`;
        }

        let topcUl = document.querySelector(".topc-col-scroll");
        data.topics.forEach(str => {
            let newLi = document.createElement("div");
            newLi.classList.add("topc-col-li");
            newLi.innerHTML = str + '<i class="fa-solid fa-chevron-down topc-chevron"></i>'
            newLi.addEventListener("click", () => {
                window.location.href = `/questions/${certificate}/` + subject + `/${level}/` + newLi.textContent.replace(/ /g, "-").replace(/&/g, "and").replace().replace(/,/g, "").replace(/\//g, "-").replace(/:/g, "").replace(/\?/g, "").replace(/\|/g, "").replace(/[#.+/'()]/g, "").replace(/---/g, "-").replace(/--/g, "-").toLowerCase();
            }); 
            dynamicLightMode(newLi);

            topcUl.appendChild(newLi);
        });
    });

    document.querySelectorAll(".quiz-redirect").forEach(btn => {
        btn.onclick = () => {
            window.location.href = `/quiz/${certificate}/${subject}/${level}/general`;
        }
    });

    document.querySelector(".topc-inp").addEventListener("input", checkResults);
    document.querySelector(".topc-inp").addEventListener("focus", checkResults);
    function checkResults(){
        let inpValue = document.querySelector(".topc-inp").value.toLowerCase();
        let topicFound = false;
        document.querySelector(".topc-result-container").innerHTML = "";
        topics.forEach(topic => {
            if(inpValue.length > 2 && topic.toLowerCase().includes(inpValue)){
                topicFound = true;
                let newSection = document.createElement("div");
                newSection.classList.add("topc-result-section");
                newSection.innerHTML = `
                    <img src="/images/icons/search3.png" class="topc-result-icon">
                    <div class="topc-result-txt">${topic}</div>
                `
                dynamicLightMode(newSection);
                newSection.addEventListener("click", () => {
                    window.location.href = `/questions/${certificate}/` + subject + `/${level}/` + topic.replace(/ /g, "-").replace(/&/g, "and").replace(/---/g, "-").replace(/--/g, "-").replace().replace(/,/g, "").replace(/\//g, "-").replace(/:/g, "").replace(/\?/g, "").replace(/\|/g, "").replace(/[#.+/'()]/g, "").toLowerCase();
                }); 

                document.querySelector(".topc-result-container").appendChild(newSection);
                let resultHeight = document.querySelector(".topc-result-container").offsetHeight;
                document.querySelector(".topc-inp-container").style.marginBottom = String(resultHeight - 31) + "px";
                document.querySelector(".topc-result-container").style.opacity = "1";
            } 
        });
        if(!topicFound){
            document.querySelector(".topc-inp-container").style.marginBottom = "20px";
            document.querySelector(".topc-result-container").style.opacity = "0";
        }
    }

    async function getSidePapers(){
        try {
            const response = await fetch(url + `/api/papers/${certificate}/${subject}/${level}`, {
                method: 'GET',
                
            });
            const data = await response.json(); 
            const papers = data.papers;
            let paperCount = 0;
            if(data.message == "success"){
                papers.forEach((paper) => {if(paper.version == "q" && paper.type == "state"){
                    paperCount++;
                    let newRow = document.createElement("div");
                    newRow.classList.add("pap-row");
                    newRow.classList.add("topc-pap-row");
                    let paperPart = "";
                    if(paper.part != "no-part") paperPart = paper.part;

                    let schemeUrl = "/not-found";
                    let schemeTarget = "style='opacity: 0; pointer-events: none;'";
                    papers.forEach(scheme => {
                        if(scheme.version == "m" && scheme.year == paper.year && scheme.subject == paper.subject && scheme.level == paper.level && scheme.type == paper.type && scheme.certificate == paper.certificate){
                            schemeUrl = scheme.url;
                            schemeTarget = "";
                        }
                    });

                    newRow.innerHTML = `
                        <div class="pap-year-col">
                            <div class="pap-m-type">${paperPart}</div>
                            <div class="pap-year">${paper.year}</div>
                        </div>
                        <a href="${paper.url}" target="_blank" class="pap-img-container">
                            <img src="/images/eg_paper.png" alt="Exam Paper" class="pap-img">
                        </a>
                        <a href="${schemeUrl}" target="_blank" class="pap-img-container" ${schemeTarget}>
                            <img src="/images/eg_scheme.png" alt="Exam Paper" class="pap-img">
                        </a>
                    `;
                    dynamicLightMode(newRow);
                    document.getElementById("papCol").appendChild(newRow);
                }});

                async function getSideResults(){
                    try {
                        const response = await fetch(url + `/api/get-results`, {
                            method: 'GET',
                            
                        });
                        const data = await response.json(); 
                        const results = data.results;
                        let quizCount = 0;
                        results.forEach(result => {
                            let subjectSlug = result.subject.toLowerCase().replace(/ /g, "-").replace(/[(&)]/g, "").replace("--", "-");
                            if(subjectSlug == subject){
                                quizCount++;
                                let newRow = document.createElement("div");
                                newRow.classList.add("pap-row");
                                newRow.innerHTML = `
                                    <div class="topc-res-name">${result.topic}</div>
                                    <div class="topc-res-txt res-date">${result.date_taken}</div>
                                    <div class="topc-res-score">${result.score}</div>
                                `;
                                dynamicLightMode(newRow);
                                document.querySelector(".topc-res-col").appendChild(newRow);
                
                                newRow.querySelector(".topc-res-name").onclick = () => {
                                    document.querySelector(".ana-modal").innerHTML = result.html;
                                    document.querySelector(".ana-modal").style.opacity = "1";
                                    document.querySelector(".ana-modal").style.pointerEvents = "auto";
                                    document.querySelector(".ana-modal").onclick = (e) => {
                                        if(!document.querySelector(".ana-wrapper").contains(e.target)){
                                            document.querySelector(".ana-modal").style.opacity = "0";
                                            document.querySelector(".ana-modal").style.pointerEvents = "none";
                                        }
                                    }
                                    document.querySelector("i.ana-close").onclick = () => {
                                        document.querySelector(".ana-modal").style.opacity = "0";
                                        document.querySelector(".ana-modal").style.pointerEvents = "none";
                                    }
                                }
                            }
                        });
                        if(quizCount == 0){
                            document.querySelector(".res-inside-scroll").style.display = "none";
                            document.querySelector(".topc-empty").style.display = "flex";
                        }
                        clickOption(".res-box", "res-box-active");
                        colourScores(); 
                        if(window.innerWidth > 1310){
                            let height = getComputedStyle(document.querySelector(".topc-col")).height;
                            document.querySelector(".topc-feat").style.height = height;
                            document.querySelector(".topc-pap-pap").style.height = "100%";
                            //document.querySelector(".topc-col-scroll").style.height = `calc(${height} - 194px)`;
                        }
                        if(newCourse){
                            document.querySelector(".topc-feat").style.height = "auto";
                            document.querySelector(".topc-pap-pap").style.height = "auto";
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                }
                getSideResults();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getSidePapers();
}

if(examContainer){
    const pathParts = window.location.pathname.split('/');
    const certificate = pathParts[2];
    const subject = pathParts[3];
    const level = pathParts[4];
    const topic = pathParts[5];

    let questionCount = 0;
    let stateCount = 0;
    let mockCount = 0;

    async function getData(){
        try {
            const response = await fetch(url + `/api/images/${certificate}/${subject}/${level}/${topic}`);
            const data = await response.json();
            data.images.sort((a, b) => Number(a.year) - Number(b.year));

            //document.querySelector(".exam-question-img").src = data[4].url;
            
            let examContent = document.querySelector(".exam-content");
            let usedIds = [];

            let isQuestionFound = false;
            data.images.forEach(obj => {
                if((obj.type == "state" || obj.type == "deferred") && obj.version == "question"){
                    isQuestionFound = true;
                }
            });

            if(!isQuestionFound){
                document.querySelector(".sav-empty").style.display = "flex";
                document.querySelector(".exam-container").style.display = "none";
                makeTitle();
            }

            document.getElementById("btnQuiz").onclick = () => {
                window.location.href = `/quiz/${certificate}/${subject}/${level}/${topic}`;
            }

            data.images.forEach((obj, idx) => {
                if(idx == 0){
                    document.querySelector(".home-title").textContent = obj.topic.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                }

                let isUsed = false;
                usedIds.forEach(usedId => {
                    if(usedId == obj.id){
                        isUsed = true;
                    }
                });

                let matchedAudio;
                data.audios.forEach(audio => {
                    if(audio.year == obj.year && audio.option == obj.option && audio.part == obj.part && audio.question.slice(1) == obj.question.slice(1) && audio.type == obj.type){
                        matchedAudio = audio;
                    }
                });

                if(!isUsed && obj.version == "question"){
                    questionCount++;
                    usedIds.push(obj.id);
                    let examQuestion = document.createElement("div");
                    examQuestion.classList.add("exam-question");
                    examQuestion.innerHTML = `
                        <div class="exam-nav">
                            <div class="exam-label"></div>

                            <div class="exam-manage">
                            <div class="manage-drop">
                                        <div class="manage-flex">
                                            <div class="manage-box"><i class="fa-solid fa-check manage-check"></i></div>
                                            <div class="manage-label">Mark complete</div>
                                        </div>
                                        <div class="manage-flex">
                                            <div class="manage-box"><i class="fa-solid fa-check manage-check"></i></div>
                                            <div class="manage-label">Save question</div>
                                        </div>
                                        <div class="manage-hr"></div>
                                        <div class="manage-flex manage-action manage-print">
                                            <i class="fa-solid fa-print manage-icon"></i>
                                            <div class="manage-label">Print question</div>
                                        </div>
                                        <div class="manage-flex manage-action manage-paper">
                                            <i class="fa-solid fa-file-pdf manage-icon"></i>
                                            <div class="manage-label">Full paper</div>
                                        </div>
                                    </div>
                            <i class="fa-solid fa-gear exam-gear"></i> Manage <i class="fa-solid fa-chevron-down manage-chevron"></i></div>
                        </div>
                        <div class="exam-wrapper">
                            <div class="exam-type"></div>

                            <div class="audio-wrapper">
                            </div>

                            <div class="exam-ques-container">
                            </div>

                            <div class="exam-view-container">
                                <div class="btn-view">View Marking Scheme <i class="fa-regular fa-eye exam-eye-icon exam-eye-open"></i> <i class="fa-regular fa-eye-slash exam-eye-icon exam-eye-slash"></i></div>
                            </div>

                            <div class="scheme-img-container">
                            </div>
                        </div>
                    `
                    dynamicLightMode(examQuestion);
                    examContent.prepend(examQuestion);
                    const examQuestionCont = examQuestion.querySelector(".exam-ques-container");
                    const examSchemeCont = examQuestion.querySelector(".scheme-img-container");

                    // container label
                    let typeStr = "State Exam";
                    if(obj.type == "mock"){
                        mockCount++;
                        typeStr = "Mock Exam";
                        examQuestion.querySelector(".exam-type").classList.add("pap-type-mock");
                        examQuestion.querySelector(".exam-type").textContent = "Mock Exam";
                        document.querySelector(".manage-paper").style.display = "none";
                    } else if(obj.type == "deferred"){
                        stateCount++;
                        typeStr = "Deferred Exam";
                        examQuestion.querySelector(".exam-type").classList.add("pap-type-state");
                        examQuestion.querySelector(".exam-type").textContent = "Deferred Exam";
                    } else {
                        stateCount++;
                        examQuestion.querySelector(".exam-type").classList.add("pap-type-state");
                        examQuestion.querySelector(".exam-type").textContent = "State Exam";
                    }
                    let questionText = " - Question " + obj.question.slice(1);
                    if(questionText == " - Question unknown"){
                        questionText = "";
                    }
                    examQuestion.querySelector(".exam-label").textContent = obj.year + " - " + typeStr + questionText;

                    let matchedObjs = [obj];
                    let matchedSchemes = [];
                    data.images.forEach((obj2, idx2) => {
                        if(idx2 != idx && obj2.layer != obj.layer && obj2.year == obj.year && obj2.option == obj.option && obj2.part == obj.part && obj2.question.slice(1) == obj.question.slice(1) && obj2.type == obj.type && obj2.version == obj.version && obj.url.split("_")[9] == obj2.url.split("_")[9]){
                            usedIds.push(obj2.id);
                            matchedObjs.push(obj2);
                        }
                        if(idx2 != idx && obj2.year == obj.year && obj2.option == obj.option && obj2.part == obj.part && obj2.question.slice(1) == obj.question.slice(1) && obj2.type == obj.type && obj2.version == "marking scheme"){
                            matchedSchemes.push(obj2);
                        }
                    });
                    matchedObjs.forEach((el, idx) => {
                        matchedObjs.forEach((mtObj) => {
                            if(mtObj.layer == (idx + 1)){
                                let newQuestionImg = document.createElement("img");
                                newQuestionImg.classList.add("exam-question-img");
                                newQuestionImg.dataset.src = mtObj.url;
                                examQuestionCont.appendChild(newQuestionImg);
                            }
                        });
                    });
                    let baseSchemeRand;
                    matchedSchemes.forEach((el, idx) => {
                        matchedSchemes.forEach((mtObj) => {
                            if(mtObj.layer == (idx + 1)){
                                if(idx == 0 && !baseSchemeRand){
                                    baseSchemeRand = mtObj.url.split("_")[9];
                                }
                                let newSchemeImg = document.createElement("img");
                                newSchemeImg.classList.add("exam-scheme-img");
                                newSchemeImg.dataset.src = mtObj.url;
                                if(mtObj.url.split("_")[9] == baseSchemeRand){
                                    examSchemeCont.appendChild(newSchemeImg);
                                }
                            }
                        });
                    });
                    lazyObserver.observe(examQuestion);

                    document.querySelectorAll(".exam-filter-txt, .exam-modal-txt").forEach(txt => {
                        if(txt.textContent.includes("All Exams")){
                            document.querySelector(".exam-title").textContent = "Exam Question (" + String(questionCount) + ")";
                            txt.querySelector(".filter-amount, .exam-modal-amount").textContent = "(" + String(questionCount) + ")";
                        } else if(txt.textContent.includes("State Exams")){
                            txt.querySelector(".filter-amount, .exam-modal-amount").textContent = "(" + String(stateCount) + ")";
                        }else if(txt.textContent.includes("Mock Exams")){
                            txt.querySelector(".filter-amount, .exam-modal-amount").textContent = "(" + String(mockCount) + ")";
                        }
                    });
                    if(document.querySelector(".exam-question")){
                        examQuestion.querySelectorAll(".exam-manage").forEach(el => {
                            el.addEventListener("click", () => {
                                if(el.querySelector(".manage-chevron").style.transform == "rotate(-180deg)"){
                                    el.querySelector(".manage-chevron").style.transform = "rotate(0deg)";
                                    el.querySelector(".manage-drop").style.opacity = "0";
                                    el.querySelector(".manage-drop").style.pointerEvents = "none";
                                } else {
                                    el.querySelector(".manage-chevron").style.transform = "rotate(-180deg)";
                                    el.querySelector(".manage-drop").style.opacity = "1";
                                    el.querySelector(".manage-drop").style.pointerEvents = "auto";
                                }
                            });
                        });

                        examQuestion.querySelectorAll(".manage-box").forEach((box, idx) => {
                            let isQuestionComplete = false;
                            let isQuestionSaved = false;
                            async function getQuestionData() {
                                const dataToSend = { id: obj.id };
                                try {
                                    const response = await fetch(url + '/api/question-data', {
                                        method: 'POST',
                                        
                                        headers: {
                                            'Content-Type': 'application/json', 
                                        },
                                        body: JSON.stringify(dataToSend), 
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('Error:', errorData.message);
                                        return;
                                    }

                                    const data = await response.json();
                                    isQuestionComplete = data.completed;
                                    isQuestionSaved = data.saved;

                                    if(data.message == "no account"){
                                        examQuestion.querySelectorAll(".manage-flex")[0].style.display = "none";
                                        examQuestion.querySelectorAll(".manage-flex")[1].style.display = "none";
                                        examQuestion.querySelector(".manage-hr").style.display = "none";
                                    }
                                    
                                    if(idx == 0){
                                        if(isQuestionComplete == "true"){
                                            box.classList.add("manage-box-active");
                                            let manageCheck = box.querySelector(".manage-check");
                                            manageCheck.classList.add("manage-check-active");
                                        }
                                        box.addEventListener("click", (e) => {
                                            e.stopPropagation();
                                            let manageCheck = box.querySelector(".manage-check");
                                            let changeTo = "true";
                                            if(box.classList.contains("manage-box-active")){
                                                changeTo = "false";
                                                box.classList.remove("manage-box-active");
                                                manageCheck.classList.remove("manage-check-active");
                                            } else {
                                                box.classList.add("manage-box-active");
                                                manageCheck.classList.add("manage-check-active");
                                            }
                                            async function toggleComplete() {
                                                const dataToSend = { id: obj.id, change: changeTo };
                                                try {
                                                    const response = await fetch(url + '/api/toggle-complete', {
                                                        method: 'POST',
                                                        
                                                        headers: {
                                                            'Content-Type': 'application/json', 
                                                        },
                                                        body: JSON.stringify(dataToSend), 
                                                    });
        
                                                    if (!response.ok) {
                                                        const errorData = await response.json();
                                                        console.error('Error:', errorData.message);
                                                        return;
                                                    }
        
                                                    const data = await response.json();
                                                } catch (error) {
                                                    console.error('Error posting data:', error);
                                                }
                                            }
                                            toggleComplete();
                                        });
                                    } else if(idx == 1){
                                        if(isQuestionSaved == "true"){
                                            box.classList.add("manage-box-active");
                                            let manageCheck = box.querySelector(".manage-check");
                                            manageCheck.classList.add("manage-check-active");
                                        }
                                        box.addEventListener("click", (e) => {
                                            e.stopPropagation();
                                            let manageCheck = box.querySelector(".manage-check");
                                            let changeTo = "true";
                                            if(box.classList.contains("manage-box-active")){
                                                changeTo = "false";
                                                box.classList.remove("manage-box-active");
                                                manageCheck.classList.remove("manage-check-active");
                                            } else {
                                                box.classList.add("manage-box-active");
                                                manageCheck.classList.add("manage-check-active");
                                            }
                                            async function toggleSave() {
                                                const dataToSend = { id: obj.id, change: changeTo };
                                                try {
                                                    const response = await fetch(url + '/api/toggle-save', {
                                                        method: 'POST',
                                                        
                                                        headers: {
                                                            'Content-Type': 'application/json', 
                                                        },
                                                        body: JSON.stringify(dataToSend), 
                                                    });
            
                                                    if (!response.ok) {
                                                        const errorData = await response.json();
                                                        console.error('Error:', errorData.message);
                                                        return;
                                                    }
            
                                                    const data = await response.json();
                                                } catch (error) {
                                                    console.error('Error posting data:', error);
                                                }
                                            }
                                            toggleSave();
                                        });
                                    }
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                }
                            }
                            getQuestionData();
                        });

                        if(matchedSchemes.length > 0){
                            examQuestion.querySelector(".btn-view").addEventListener("click", () => {
                                let autoHeight = 0;
                                examQuestion.querySelector(".scheme-img-container").querySelectorAll(".exam-scheme-img").forEach(img => {
                                    img.style.src = img.dataset.src;
                                    autoHeight = autoHeight + img.clientHeight;
                                });
                                if(examQuestion.querySelector(".scheme-img-container").style.maxHeight.includes("calc")){
                                    examQuestion.querySelector(".exam-eye-open").style.display = "block";
                                    examQuestion.querySelector(".exam-eye-slash").style.display = "none";
                                    examQuestion.querySelector(".scheme-img-container").style.maxHeight = "0px";
                                    examQuestion.querySelector(".scheme-img-container").style.margin = "0";
                                } else {
                                    examQuestion.querySelector(".exam-eye-open").style.display = "none";
                                    examQuestion.querySelector(".exam-eye-slash").style.display = "block";
                                    examQuestion.querySelector(".scheme-img-container").style.maxHeight = "calc(" + autoHeight + "px + 30px)";
                                    examQuestion.querySelector(".scheme-img-container").style.margin = "15px 0";
                                }
                            });
                        } else {
                            examQuestion.querySelector(".btn-view").innerHTML = "No Marking Scheme";
                        }

                        if(!matchedAudio){
                            examQuestion.querySelector(".audio-wrapper").style.display = "none"
                        } else {
                            examQuestion.querySelector(".exam-wrapper").style.paddingTop = "90px";
                            if(window.innerWidth < 701) examQuestion.querySelector(".exam-wrapper").style.paddingTop = "60px";
                            examQuestion.querySelector(".audio-wrapper").innerHTML = `
                                <audio id="audio"></audio>
                                <input type="range" class="audio-seek" id="seekBar" min="0" max="1" value="0.5" step="0.01">
                                <div class="audio-left">
                                <i class="fa-solid fa-rotate-left audio-back"></i>
                                <div class="audio-control">
                                    <i class="fa-solid fa-play audio-control-icon audio-play"></i>
                                    <i class="fa-solid fa-pause audio-control-icon audio-pause" style="display: none;"></i>
                                </div>
                                <i class="fa-solid fa-rotate-right audio-forward"></i>
                                </div>

                                <div class="audio-txt"><span class="audio-txt" id="audioTime">0:00</span> <span class="audio-txt audio-slash">/</span> <span class="audio-txt" id="audioTotal">0:00</span></div>
                                <div class="audio-volume">
                                    <input class="audio-range" id="volume" type="range" min="0" max="1" step="0.01" value="0.6">
                                    <i class="fa-solid fa-volume-high audio-volume-icon"></i>
                                </div>
                            `;
                            let audio = examQuestion.querySelector("audio");
                            audio.dataset.src = "https://blob-static.studyclix.ie/cms/media/90f0c743-2a7c-4286-9f14-4704a305de9c.mp3";
                            audio.addEventListener('timeupdate', () => {
                                examQuestion.querySelector("#audioTime").textContent = formatTime(audio.currentTime);
                                examQuestion.querySelector(".audio-seek").style.background = `linear-gradient(to right, #2ecc71 ${(audio.currentTime / audio.duration) * 100}%, hsl(0, 0%, 90%) ${(audio.currentTime / audio.duration) * 100}%)`;
                            });
                            audio.addEventListener('loadedmetadata', () => {
                                examQuestion.querySelector("#audioTotal").textContent = formatTime(audio.duration);
                            });
                            examQuestion.querySelector("i.audio-back").addEventListener("click", () => {
                                audio.currentTime = Math.max(0, audio.currentTime - 10);
                            });
                            examQuestion.querySelector("i.audio-forward").addEventListener("click", () => {
                                audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                            });
                            function timeToSeconds(time) {
                            const [mins, secs] = time.split(':').map(Number);
                            return mins * 60 + secs;
                            }
                            function getProgress(current, total) {
                            const currentSec = timeToSeconds(current);
                            const totalSec = timeToSeconds(total);
                            return currentSec / totalSec;
                            }
                            
                            examQuestion.querySelector(".audio-control").addEventListener('click', () => {
                                if (audio.paused) {
                                    audio.play();
                                    examQuestion.querySelector("i.audio-pause").style.display = "block";
                                    examQuestion.querySelector("i.audio-play").style.display = "none";
                                } else {
                                    audio.pause();
                                    examQuestion.querySelector("i.audio-pause").style.display = "none";
                                    examQuestion.querySelector("i.audio-play").style.display = "block";
                                }
                            });
                            examQuestion.querySelector("#volume").addEventListener("input", () => {
                                audio.volume = examQuestion.querySelector("#volume").value;
                            });
    
                            function formatTime(sec) {
                                const m = Math.floor(sec / 60);
                                const s = Math.floor(sec % 60).toString().padStart(2, '0');
                                return `${m}:${s}`;
                            }
                        }

                        examQuestion.querySelector(".manage-print").onclick = () => {
                            async function printQuesion(){
                                matchedObjs = sortImgLayers(matchedObjs);
                                matchedSchemes = sortImgLayers(matchedSchemes);
                                let questionImgs = matchedObjs.map(obj => obj.url);
                                let schemeImgs = matchedSchemes.map(obj => obj.url);
                                const dataToSend = { questionImgs, schemeImgs: schemeImgs };
                                try {
                                    const response = await fetch(url + '/api/print-question', {
                                        method: 'POST',
                                        
                                        headers: {
                                            'Content-Type': 'application/json', 
                                        },
                                        body: JSON.stringify(dataToSend), 
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('Error:', errorData.message);
                                        return;
                                    }

                                    const data = await response.json();
                                    if(data.message == "success"){
                                        window.location.href = `/worksheets/${certificate}/${subject}/${level}?sheet=${data.sheetId}&print=true`;
                                    }
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                }
                            }
                            printQuesion();
                        }

                        examQuestion.querySelector(".manage-paper").onclick = () => {
                            async function redirectPaper() {
                                const dataToSend = { questionData: obj };
                                try {
                                    const response = await fetch(url + '/api/single-paper', {
                                        method: 'POST',
                                        
                                        headers: {
                                            'Content-Type': 'application/json', 
                                        },
                                        body: JSON.stringify(dataToSend), 
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('Error:', errorData.message);
                                        return;
                                    }

                                    const data = await response.json();
                                    if(data.message == "success") window.open(data.url, "_blank");
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                }
                            }
                            redirectPaper();
                        }
                    }
                }
            });
            document.querySelectorAll(".exam-filter-section").forEach((section, idx) => {
                if(idx == 0){
                    section.querySelectorAll(".exam-filter-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {
                            if(box.classList.contains("filter-box-active")){
                                box.classList.remove("filter-box-active");
                                box.querySelector(".filter-check").classList.remove("filter-check-active");
                            } else {
                                section.querySelectorAll(".exam-filter-box").forEach((el, elIdx) => {
                                    let filterCheck = el.querySelector(".filter-check");
                                    if(idx == elIdx){
                                        el.classList.add("filter-box-active");
                                        filterCheck.classList.add("filter-check-active");
                                        let sameText = document.querySelectorAll("div.exam-filter-txt")[elIdx];
    
                                        document.querySelectorAll(".exam-question").forEach((cont, contIdx) => {
                                            let typeStr = cont.querySelector(".exam-type").textContent;
    
                                            if(sameText.textContent.includes("All Exams")){
                                                cont.style.display = "block";
                                            } else if(sameText.textContent.includes("State Exams")){
                                                if(typeStr == "State Exam" || typeStr == "Deferred Exam"){
                                                    cont.style.display = "block";
                                                } else {
                                                    cont.style.display = "none";
                                                }
                                            } else if(sameText.textContent.includes("Mock Exams")){
                                                if(typeStr == "Mock Exam"){
                                                    cont.style.display = "block";
                                                } else {
                                                    cont.style.display = "none";
                                                }
                                            }
                                        });
                                    } else {
                                        el.classList.remove("filter-box-active");
                                        filterCheck.classList.remove("filter-check-active");
                                    }
                                });
                            }
                        });
                    });
                } else if(idx == 1){
                    section.querySelectorAll(".exam-filter-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {
                            if(idx == 1){
                                for(let i = document.querySelectorAll(".exam-question").length - 1; i >= 0; i--){
                                    document.querySelectorAll(".exam-question")[i].style.order = String(document.querySelectorAll(".exam-question").length - i);
                                    console.log(String(document.querySelectorAll(".exam-question").length - i));
                                }
                            } else {
                                document.querySelectorAll(".exam-question").forEach(question => question.style.order = "0");
                            }
                        });
                    });
                }
            });
            document.querySelectorAll(".exam-filter-section").forEach((section, idx) => {
                section.querySelectorAll(".exam-filter-box").forEach(box => {
                    box.addEventListener("click", () => {
                        section.querySelectorAll(".exam-filter-box").forEach(other => {
                            other.classList.remove("filter-box-active");
                            other.querySelector(".filter-check").classList.remove("filter-check-active");
                        });
                        box.classList.add("filter-box-active");
                        box.querySelector(".filter-check").classList.add("filter-check-active");
                    });
                });
            });
            document.querySelectorAll(".exam-modal-section").forEach(section => {
                section.querySelectorAll(".exam-modal-box").forEach(box => {
                    box.addEventListener("click", () => {
                        section.querySelectorAll(".exam-modal-box").forEach(other => {
                            other.classList.remove("exam-modal-box-active");
                            other.querySelector(".exam-modal-check").classList.remove("exam-modal-check-active");
                        });
                        box.classList.add("exam-modal-box-active");
                        box.querySelector(".exam-modal-check").classList.add("exam-modal-check-active");
                    });
                });
            });
            document.querySelectorAll(".exam-modal-section").forEach((section, secIdx) => {
                if(secIdx == 0){
                    section.querySelectorAll(".exam-modal-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {
                            section.querySelectorAll(".exam-modal-box").forEach((el, elIdx) => {
                                if(idx == elIdx){
                                    let sameText = document.querySelectorAll("div.exam-modal-txt")[elIdx];
    
                                    document.querySelectorAll(".exam-question").forEach((cont, contIdx) => {
                                        let typeStr = cont.querySelector(".exam-type").textContent;
                                        if(sameText.textContent.includes("All Exams")){
                                            cont.style.display = "block";
                                        } else if(sameText.textContent.includes("State Exams")){
                                            if(typeStr == "State Exam" || typeStr == "Deferred Exam"){
                                                cont.style.display = "block";
                                            } else {
                                                cont.style.display = "none";
                                            }
                                        } else if(sameText.textContent.includes("Mock Exams")){
                                            if(typeStr == "Mock Exam"){
                                                cont.style.display = "block";
                                            } else {
                                                cont.style.display = "none";
                                            }
                                        }
                                    });
                                } 
                            });
                        });
                    });
                } else if(secIdx == 1){
                    section.querySelectorAll(".exam-modal-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {
                            if(idx == 1){
                                for(let i = document.querySelectorAll(".exam-question").length - 1; i >= 0; i--){
                                    document.querySelectorAll(".exam-question")[i].style.order = String(document.querySelectorAll(".exam-question").length - i);
                                    console.log(String(document.querySelectorAll(".exam-question").length - i));
                                }
                            } else {
                                document.querySelectorAll(".exam-question").forEach(question => question.style.order = "0");
                            }
                        });
                    });
                }
            });
            document.querySelector(".btn-modal-clear").addEventListener("click", () => {

            });
            document.querySelector(".exam-popup").addEventListener("click", () => {
                if(document.querySelector(".exam-modal").style.opacity == "1"){
                    document.querySelector(".exam-modal").style.opacity = "0";
                    document.querySelector(".exam-modal").style.pointerEvents = "none";
                } else {
                    document.querySelector(".exam-modal").style.opacity = "1";
                    document.querySelector(".exam-modal").style.pointerEvents = "auto";
                }
            });
            document.querySelector(".exam-modal").addEventListener("click", (e) => {
                if(!document.querySelector(".exam-modal-wrapper").contains(e.target)){
                    closeFilterModal();
                }
            });;
            document.querySelector("i.set-exit").addEventListener("click", closeFilterModal);
            function closeFilterModal(){
                document.querySelector(".exam-modal").style.opacity = "0";
                document.querySelector(".exam-modal").style.pointerEvents = "none";
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getData();

    document.addEventListener("scroll", () => {
        if(!document.querySelector(".exam-popup").style.opacity == "1"){
            document.querySelector(".exam-popup").style.opacity = "1";
        }
    });
}

if(document.querySelector(".quiz-container")){
    const pathParts = window.location.pathname.split('/');
    const certificate = pathParts[2];
    const subject = pathParts[3];
    const level = pathParts[4];
    const urlTopic = pathParts[5];

    let certText = "lc";
    if(certificate == "junior-certificate"){
        certText = "jc";
    }

    let guesses = [];
    let results = [];

    let topics;
    let thisTopic;
    let quizQuestions;
    let currentQuestionIdx = 0;
    let currentAnswer;
    fetch(`/quizzes/${certText}/${subject}_${level}.json`)
    .then(res => {
        if(!res.ok){
            document.querySelector(".home-content").style.height = "90vh";
            document.querySelector(".quiz-container").style.display = "none";
            document.querySelector(".sav-empty").style.display = "flex";
            throw new Error(`Quiz not found: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        topics = data;
        let quizFound = false;

        topics.forEach((topic, idx) => {
            if((urlTopic == "general" && idx == 0) || topic.topic.replace(/ /g, "-").replace(/&/g, "and").replace(/---/g, "-").replace(/--/g, "-").replace().replace(/,/g, "").replace(/\//g, "-").replace(/:/g, "").replace(/\?/g, "").replace(/\|/g, "").replace(/[#.+/'()]/g, "").toLowerCase() == urlTopic){
                quizFound = true;
                thisTopic = topic;
                document.querySelector(".quiz-tag").textContent = topic.topic;
                document.querySelector(".quiz-title").textContent = topic.subject + " Quiz";
                quizQuestions = shuffleArray(topic.quiz);
                
                if(urlTopic == "general"){
                    document.querySelector(".quiz-tag").textContent = "General Quiz";
                    let allQuestions = [];
                    topics.forEach(obj => {
                        obj.quiz.forEach(question => {
                            allQuestions.push(question);
                        });
                    });
                    allQuestions = shuffleArray(allQuestions);
                    quizQuestions = [];
                    allQuestions.forEach((question, idx) => {
                        if(idx < 10){
                            quizQuestions.push(question);
                        }
                    });
                }

                quizQuestions.forEach((question, idx) => {
                    guesses.push(null);
                    results.push(false);
                    let newQuestion = document.createElement("div");
                    newQuestion.classList.add("quiz-question");
                    if(idx == 0){
                        newQuestion.classList.add("quiz-question-active");
                        if(question.type == "input"){
                            document.getElementById("quizContinueBtn").textContent = "Check";
                            document.getElementById("quizContinueBtn").onclick = checkInput;
                        }
                    }
                    newQuestion.innerHTML = `
                        <div class="quiz-head">${question.text}</div>
                        <div class="quiz-guide"></div>
        
                        <div class="quiz-col">
                            <div class="quiz-wrapper quiz-wrapper-active">
                                <div class="quiz-circle quiz-circle-active"><div class="quiz-circle-fill quiz-circle-fill-active"></div></div>
                                <div class="quiz-txt">Flagella</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">Plasmid</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">RNA/DNA</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">Bioreacter</div>
                            </div>
                            <!-- 
                            <input type="text" placeholder="Your answer" class="quiz-input">
                            -->
                        </div>
                    `
                    dynamicLightMode(newQuestion);

                    let guideTxt;
                    if(question.type == "choice"){
                        guideTxt = "Select an answer:";
                        let choiceIndexes = shuffledNums();
                        newQuestion.querySelector(".quiz-col").innerHTML = `
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">${question.choices[choiceIndexes[0]]}</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">${question.choices[choiceIndexes[1]]}</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">${question.choices[choiceIndexes[2]]}</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">${question.choices[choiceIndexes[3]]}</div>
                            </div>
                        `;
                    } else if(question.type == "truefalse"){
                        guideTxt = "Select true or false:";
                        newQuestion.querySelector(".quiz-col").innerHTML = `
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">True</div>
                            </div>
                            <div class="quiz-wrapper">
                                <div class="quiz-circle"><div class="quiz-circle-fill"></div></div>
                                <div class="quiz-txt">False</div>
                            </div>
                        `;
                    } else if(question.type == "input"){
                        guideTxt = "Type your answer:";
                        newQuestion.querySelector(".quiz-col").innerHTML = `
                            <input type="text" placeholder="Your answer" class="quiz-input" />
                        `
                        newQuestion.querySelector(".quiz-input").addEventListener("input", () => {
                            if(newQuestion.querySelector(".quiz-input").value != ""){
                                document.getElementById("quizContinueBtn").classList.remove("btn-quiz-inactive");
                                document.getElementById("quizSkipBtn").classList.add("btn-quiz-inactive");
                            } else {
                                document.getElementById("quizContinueBtn").classList.add("btn-quiz-inactive"); 
                                document.getElementById("quizSkipBtn").classList.remove("btn-quiz-inactive");
                            }
                            currentAnswer = newQuestion.querySelector(".quiz-input").value;
                        });
                    }
                    newQuestion.querySelector(".quiz-guide").textContent = guideTxt;

                    newQuestion.querySelectorAll(".quiz-wrapper").forEach((wrapper, idx) => {
                        wrapper.onclick = () => {
                            newQuestion.querySelectorAll(".quiz-wrapper").forEach(other => {
                                other.style.pointerEvents = "none";
                                other.classList.remove("quiz-wrapper-active");
                                other.querySelector(".quiz-circle").classList.remove("quiz-circle-active");
                                other.querySelector(".quiz-circle-fill").classList.remove("quiz-circle-fill-active");
                            });
                            let isCorrect = false;
                            currentAnswer = wrapper.querySelector(".quiz-txt").textContent;
                            if(question.type == "truefalse"){
                                if(idx == 0){
                                    currentAnswer = true;
                                } else {
                                    currentAnswer = false;
                                }
                                if(currentAnswer === question.answer){
                                    displayAnswer(wrapper, null);
                                    isCorrect = true;
                                } else {
                                    newQuestion.querySelectorAll(".quiz-wrapper").forEach(check => {
                                        if(check.querySelector(".quiz-txt").textContent.toLowerCase() == String(question.answer)){
                                            displayAnswer(check, wrapper);
                                        }
                                    });
                                }
                            } else if(question.type == "choice"){
                                if(currentAnswer == question.choices[question.answer]){
                                    displayAnswer(wrapper, null);
                                    isCorrect = true;
                                } else {
                                    newQuestion.querySelectorAll(".quiz-wrapper").forEach(check => {
                                        if(check.querySelector(".quiz-txt").textContent == question.choices[question.answer]){
                                            displayAnswer(check, wrapper);
                                        }
                                    });
                                }
                            }
                            if(isCorrect){
                                results[currentQuestionIdx] = true;
                            } else {
                                results[currentQuestionIdx] = false;
                            }

                            document.getElementById("quizContinueBtn").classList.remove("btn-quiz-inactive");
                            document.getElementById("quizSkipBtn").classList.add("btn-quiz-inactive");
                        }
                    });

                    document.querySelector(".quiz-ul").appendChild(newQuestion);
                });
            }
        });

        if(!quizFound){
            document.querySelector(".home-content").style.height = "90vh";
            document.querySelector(".quiz-container").style.display = "none";
            document.querySelector(".sav-empty").style.display = "flex";
        }
    });

    function nextQuizQuestion(){
        document.getElementById("quizSkipBtn").classList.remove("btn-quiz-inactive");
        guesses[currentQuestionIdx] = currentAnswer;
        if(currentQuestionIdx == (guesses.length - 1)){
            document.getElementById("quizSkipBtn").classList.add("btn-quiz-inactive");
            document.querySelector(".quiz-bar-fill").style.width = `100%`;
        } else {
            currentQuestionIdx++;
            if(quizQuestions[currentQuestionIdx].type == "input"){
                document.getElementById("quizContinueBtn").textContent = "Check";
                document.getElementById("quizContinueBtn").onclick = checkInput;
            } else if(currentQuestionIdx == (guesses.length - 1)){
                document.getElementById("quizContinueBtn").textContent = "View Results";
                document.getElementById("quizContinueBtn").onclick = viewResults;
            }
            if(document.querySelectorAll(".quiz-wrapper")[currentQuestionIdx])
            document.querySelector(".quiz-prog-txt").textContent = String(currentQuestionIdx + 1) + "/10";
            document.querySelector(".quiz-question-active").classList.remove("quiz-question-active");
            document.querySelectorAll(".quiz-question")[currentQuestionIdx].classList.add("quiz-question-active");
            document.getElementById("quizContinueBtn").classList.add("btn-quiz-inactive");
            document.querySelector(".quiz-bar-fill").style.width = `calc((${currentQuestionIdx + 1} / 10) * 100%)`;
        }
    }
    function checkInput(){
        let isDone = false;
        let answerExample;
        quizQuestions[currentQuestionIdx].answer.forEach((ans, idx) => {
            if(idx == 0){
                answerExample = ans;
            }
            if(levenshtein(currentAnswer.toLowerCase(), ans.toLowerCase()) <= 3 && !isDone){
                isDone = true;
                document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").style.border = "1px solid hsl(145, 65%, 45%)";
                document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").style.color = "hsl(145, 65%, 45%)";
                results[currentQuestionIdx] = true;
                if(currentAnswer.toLowerCase() != ans.toLowerCase()){
                    document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").value = currentAnswer + " (" + ans + ")";
                }
            }
        });
        if(!isDone){
            document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").style.border = "1px solid rgb(204, 39, 39)";
            document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").style.color = "rgb(204, 39, 39)";
            document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").value = currentAnswer + " (" + answerExample + ")";
        }
        document.querySelectorAll(".quiz-question")[currentQuestionIdx].querySelector(".quiz-input").style.pointerEvents = "none";
        document.getElementById("quizContinueBtn").textContent = "Continue";
        if(currentQuestionIdx == (guesses.length - 1)){
            guesses[currentQuestionIdx] = currentAnswer;
            document.getElementById("quizContinueBtn").textContent = "View Results";
            document.getElementById("quizContinueBtn").onclick = viewResults;
        } else {
            document.getElementById("quizContinueBtn").onclick = nextQuizQuestion;
        }
    }
    function viewResults(){
        guesses[currentQuestionIdx] = currentAnswer;
        document.querySelector(".ana-modal").style.opacity = "1";
        document.querySelector(".ana-modal").style.pointerEvents = "auto";
        document.querySelector("i.ana-close").addEventListener("click", () => {
            previousPage();
        });
        document.querySelector(".ana-title").textContent = thisTopic.subject + " Quiz";
        let degree = Math.ceil(String(180 * (results.filter(res => res == true).length / results.length)));
        document.querySelector(".circ-fill").style.background = `conic-gradient(from 90deg,hsl(145, 65%, 45%) 0deg ${degree}deg, transparent ${degree}deg 360deg)`;
        document.getElementById("anaStatPercent").textContent = String((results.filter(res => res == true).length / results.length) * 100) + "%";
        document.getElementById("anaStatCorrect").innerHTML = `${results.filter(res => res == true).length}/ <span class="ana-stat-txt">${results.length}</span>`;
        let date = new Date();
        let formatted = date.toLocaleDateString("en-US", {
            month: "short", // 3-letter month
            day: "numeric",
            year: "numeric"
        });
        document.querySelector(".ana-info-txt").innerHTML = `Finished ${formatted}<div class="ana-dot"></div><span class="ana-info-txt"><i class="fa-regular fa-circle-question ana-info-icon"></i>${results.length} Questions</span>`;
        results.forEach((result, idx) => {
            if(result == true){
                document.querySelectorAll(".ana-box")[idx].innerHTML = `${idx + 1}<div class="ana-check-box perc-green"><i class="fa-solid fa-check ana-box-icon"></i></div>`;
            } else {
                document.querySelectorAll(".ana-box")[idx].innerHTML = `${idx + 1}<div class="ana-check-box perc-red"><i class="fa-solid fa-xmark ana-box-icon"></i></div>`;
            }
            document.querySelectorAll(".ana-box")[idx].style.display = "flex";

            let newBox = document.createElement("div");
            newBox.classList.add("ana-ques");

            let topStatus = `<i class="fa-solid fa-check ana-ques-check"></i> Correct`;
            let yourAnswer = `<i class="fa-solid fa-check ana-answer-check"></i> ${String(guesses[idx])}`;
            if(result == false){
                yourAnswer = `<i class="fa-solid fa-xmark ana-answer-xmark"></i> ${String(guesses[idx])}`;
                topStatus = `<i class="fa-solid fa-xmark ana-ques-xmark"></i> Inorrect`;
            }
            let typeHtml;
            let correctAnswer;
            if(quizQuestions[idx].type == "choice"){
                typeHtml = `<i class="fa-solid fa-list-check ana-type-icon"></i> Multiple choice`;
                correctAnswer = quizQuestions[idx].choices[quizQuestions[idx].answer];
            } else if(quizQuestions[idx].type == "truefalse"){
                typeHtml = `<i class="fa-solid fa-right-left ana-type-icon"></i> True or false`;
                correctAnswer = String(quizQuestions[idx].answer);
            } else if(quizQuestions[idx].type == "input"){
                typeHtml = `<i class="fa-solid fa-pen-to-square ana-type-icon"></i> Fill the blank`;
                correctAnswer = quizQuestions[idx].answer[0];
            }
            newBox.innerHTML = `
                <div class="ana-ques-top">
                    <div class="ana-ques-txt ana-ques-top-txt"><span class="ana-ques-txt">Question ${idx + 1}</span> <div class="ana-dot"></div> ${topStatus}</div>
                    <div class="ana-type">${typeHtml}</div>
                </div>
                <div class="ana-ques-title">${quizQuestions[idx].text}</div>

                <div class="ana-answer-flex">
                    <div class="ana-answer-col">
                        <div class="ana-answer-label">Correct answer</div>
                        <div class="ana-answer-txt ana-cor">${correctAnswer}</div>
                    </div>
                    <div class="ana-answer-col">
                        <div class="ana-answer-label">Your answer</div>
                        <div class="ana-answer-txt">${yourAnswer}</div>
                    </div>
                </div>
            `;
            dynamicLightMode(newBox);
            document.querySelector(".ana-ques-col").appendChild(newBox);
        });
        document.querySelectorAll("div.ana-perc-txt")[0].innerHTML = `Correct <span class="ana-perc-txt">${results.filter(res => res == true).length}</span> <div class="ana-dot"></div> ${(results.filter(res => res == true).length / results.length) * 100}%`;
        document.querySelectorAll("div.ana-perc-txt")[1].innerHTML = `Incorrect <span class="ana-perc-txt">${results.filter(res => res == false).length}</span> <div class="ana-dot"></div> ${(results.filter(res => res == false).length / results.length) * 100}%`;

        async function saveQuiz(){
            let currentDate = getCurrentDate();
            let baseTopic = thisTopic.topic;
            if(urlTopic == "general"){
                baseTopic = "General " + thisTopic.subject + " Quiz";
            }
            const dataToSend = { html: document.querySelector(".ana-modal").innerHTML, subject: thisTopic.subject, topic: baseTopic, date: currentDate, score: `${(results.filter(res => res == true).length / results.length) * 100}%` };
            try {
                const response = await fetch(url + '/api/save-quiz', {
                    method: 'POST',
                    
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend), 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    return;
                }

            } catch (error) {
                console.error('Error posting data:', error);
            }
        }   
        saveQuiz();
    }
    
    function displayAnswer(correctWrapper, falseWrapper){
        correctWrapper.classList.add("quiz-wrapper-correct");
        correctWrapper.querySelector(".quiz-circle").classList.add("quiz-circle-correct");
        correctWrapper.querySelector(".quiz-circle-fill").classList.add("quiz-circle-fill-correct");

        if(falseWrapper){
            falseWrapper.classList.add("quiz-wrapper-false");
            falseWrapper.querySelector(".quiz-circle").classList.add("quiz-circle-false");
            falseWrapper.querySelector(".quiz-circle-fill").classList.add("quiz-circle-fill-false");
        }
    }
    function shuffledNums(){
        let arr = [0, 1, 2, 3];
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); 
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
        }
        return arr;
    }
    function skipQuestion(){
        currentAnswer = "Not Entered";
        results[currentQuestionIdx] = false;
        document.getElementById("quizContinueBtn").click();
    }
}

if(document.querySelector(".bld-container")){
    clickOption(".btn-bld-view", "btn-bld-active");

    if(parts.length > 2){
        document.querySelector(".home-back").style.display = "flex";
        document.querySelector(".pap-form").style.display = "none";
        document.querySelector(".bld-container").style.display = "flex";
        if(params.get("sheet") && !isNaN(params.get("sheet"))){
            async function displaySheet() {
                const dataToSend = { sheetId: Number(params.get("sheet")) };
                try {
                    const response = await fetch(url + '/api/display-sheet', {
                        method: 'POST',
                        
                        headers: {
                            'Content-Type': 'application/json', 
                        },
                        body: JSON.stringify(dataToSend), 
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error:', errorData.message);
                        return;
                    }

                    const data = await response.json();
                    const sheetData = data.sheetData;
                    if(data.message == "success"){
                        if(params.get("print")){
                            let newQuestionImgs = sheetData.question_data.split(",");
                            let newSchemeImgs = sheetData.scheme_data.split(",");
                            sheetQuestionImgs = [newQuestionImgs];
                            sheetSchemeImgs = [newSchemeImgs];
                            isFirstImg = false;
                            let firstContainer = document.querySelector(".she-img-container");
                            newQuestionImgs.forEach(img => {
                                firstContainer.innerHTML += `<img class='bld-ques-img' src='${img}' />`;
                            });
                            firstContainer.querySelectorAll(".bld-ques-img").forEach(img => {
                                img.classList.remove("bld-ques-img");
                                img.classList.add("she-img");
                            });
                            let currentPage = "";
                            let availableHeight = firstContainer.clientHeight;
                            let currentHeight = 0;
                            firstContainer.querySelectorAll(".she-img").forEach((img, idx) => {
                                if(idx == 0){
                                    let deleteIcon = document.createElement("div");
                                    deleteIcon.classList.add("she-delete");
                                    deleteIcon.classList.add("she-img-delete");
                                    deleteIcon.style.cursor = "pointer";
                                    deleteIcon.innerHTML = `<i class="fa-solid fa-xmark she-delete she-img-delete" id="${img.src}"></i>`;
                                    dynamicLightMode(deleteIcon);
                                    document.querySelector(".she-wrapper").appendChild(deleteIcon);
                                    img.classList.add("she-first-img");
                                    document.querySelector(".she-container").addEventListener("click", (e) => {if(e.target.id == img.src){
                                        let previousTop = document.querySelector(".she-top").innerHTML;
                                        document.querySelectorAll(".she-wrapper").forEach(wrapper => {
                                            newQuestionImgs.forEach(src => {
                                                if(wrapper.querySelector(".she-img") && wrapper.querySelector(".she-img").src == src){
                                                    document.querySelector(".she-container").removeChild(wrapper);
                                                }
                                            });
                                        });
                                        if(!document.querySelector(".she-title")){
                                            let secondWrapper;
                                            document.querySelectorAll(".she-wrapper").forEach(downPage => {
                                                if(!secondWrapper && downPage.querySelector(".she-img")){
                                                    secondWrapper = downPage;
                                                }
                                            });
                                            if(secondWrapper){
                                                let topHtml = document.createElement("div");
                                                topHtml.classList.add("she-top");
                                                topHtml.innerHTML = previousTop;
                                                dynamicLightMode(topHtml);
                                                secondWrapper.prepend(topHtml);
                                                orderPages(secondWrapper);
                                            } else {
                                                let newFirstWrapper = document.createElement("div");
                                                newFirstWrapper.classList.add("she-wrapper");
                                                newFirstWrapper.innerHTML = `
                                                    <div class="she-wrapper-inside">
                                                        <div class="she-top">
                                                            ${previousTop}
                                                        </div>
                                                        
                                                        <div class="she-img-container">
                                                        </div>
                                                    </div>
                                                    <div class="she-idx">1</div>
                                                `
                                                dynamicLightMode(newFirstWrapper);
                                                document.querySelector(".she-container").prepend(newFirstWrapper);
                                                isFirstImg = true;
                                            }
                                        }
                                        if(newSchemeImgs[0]){
                                            sheetSchemeImgs = sheetSchemeImgs.filter(srcSet => !srcSet.includes(newSchemeImgs[0]));
                                        }
                                        if(newQuestionImgs[0]){
                                            sheetQuestionImgs = sheetQuestionImgs.filter(srcSet => !srcSet.includes(newQuestionImgs[0]));
                                        }
                                        resetPageNumbers();
                                    }});
                                }

                                setTimeout(() => {
                                    currentHeight += img.clientHeight;
                                    if(currentPage != "" && currentHeight <= availableHeight){
                                        currentPage.querySelector(".she-img-container").appendChild(img);
                                    }
                                    if(currentHeight > availableHeight){
                                        currentHeight = img.clientHeight;
                                        let nextIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                                        currentPage = document.createElement("div");
                                        currentPage.classList.add("she-wrapper");
                                        currentPage.innerHTML = `
                                            <div class="she-wrapper-inside">
                                                <div class="she-img-container">
                                                    ${img.outerHTML}
                                                </div>
                                            </div>
                                            <div class="she-idx">${nextIdx}</div>
                                        `
                                        dynamicLightMode(currentPage);
                                        if(document.querySelector(".she-extra-page")){
                                            document.querySelector(".she-container").insertBefore(currentPage, document.querySelector(".she-extra-page"));
                                        } else {
                                            document.querySelector(".she-container").appendChild(currentPage);
                                        }
                                        firstContainer.removeChild(img);
                                    }
                                }, 500);
                            });
                            resetPageNumbers();
                        } else if(data.userType == "logged"){
                            document.querySelector(".she-container").innerHTML = sheetData.html;
                            sheetSchemeImgs = sheetData.scheme_data.split(",,");
                            sheetSchemeImgs = sheetSchemeImgs.map(part => part.split(","));
                            sheetQuestionImgs = sheetData.question_data.split(",,");
                            sheetQuestionImgs = sheetQuestionImgs.map(part => part.split(","));
                            document.getElementById("bldInput").value = sheetData.title;
                            if(document.querySelector(".she-img")){
                                isFirstImg = false;
                            }
    
                            document.querySelectorAll(".she-img").forEach(img => {
                                document.querySelector(".she-container").addEventListener("click", (e) => {if(e.target.id == img.src){
                                    let previousTop = document.querySelector(".she-top").innerHTML;
                                    let xmarkIdx;
                                    document.querySelectorAll("i.she-img-delete").forEach((el, elIdx) => {
                                        if(el == e.target) xmarkIdx = elIdx;
                                    });
                                    document.querySelectorAll(".she-wrapper").forEach(wrapper => {
                                        sheetQuestionImgs[xmarkIdx].forEach(src => {
                                            if(wrapper.querySelector(".she-img") && wrapper.querySelector(".she-img").src == src){
                                                document.querySelector(".she-container").removeChild(wrapper);
                                            }
                                        });
                                    });
                                    if(!document.querySelector(".she-title")){
                                        let secondWrapper = document.querySelectorAll(".she-wrapper")[0];
                                        if(secondWrapper && secondWrapper.querySelector(".she-img")){
                                            let topHtml = document.createElement("div");
                                            topHtml.classList.add("she-top");
                                            topHtml.innerHTML = previousTop;
                                            dynamicLightMode(topHtml);
                                            secondWrapper.prepend(topHtml);
                                        } else {
                                            let newFirstWrapper = document.createElement("div");
                                            newFirstWrapper.classList.add("she-wrapper");
                                            newFirstWrapper.innerHTML = `
                                                <div class="she-wrapper-inside">
                                                    <div class="she-top">
                                                        ${previousTop}
                                                    </div>
                                                    
                                                    <div class="she-img-container">
                                                    </div>
                                                </div>
                                                <div class="she-idx">1</div>
                                            `
                                            dynamicLightMode(newFirstWrapper);
                                            document.querySelector(".she-container").prepend(newFirstWrapper);
                                            isFirstImg = true;
                                        }
                                    }
                                    if(sheetSchemeImgs[xmarkIdx][0]){
                                        sheetSchemeImgs = sheetSchemeImgs.filter(srcSet => !srcSet.includes(sheetSchemeImgs[xmarkIdx][0]));
                                    }
                                    if(sheetQuestionImgs[xmarkIdx][0]){
                                        sheetQuestionImgs = sheetQuestionImgs.filter(srcSet => !srcSet.includes(sheetQuestionImgs[xmarkIdx][0]));
                                    }
                                    resetPageNumbers();
                                }});
                            });
                            document.querySelectorAll(".she-extra-page").forEach(page => {
                                page.querySelector("div.she-delete").onclick = () => {
                                    document.querySelector(".she-container").removeChild(page);
                                    resetPageNumbers();
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error posting data:', error);
                }
            }
            displaySheet();
        }
    } else {
        document.querySelector(".home-back").style.display = "none";
    }

    let bldInput = document.querySelector(".bld-input");
    bldInput.addEventListener("input", () => {
        let newValue = bldInput.value;
        let titleElement = document.querySelector(".she-title");
        if(newValue.length > 0){
            titleElement.innerHTML = newValue;
        } else {
            titleElement.innerHTML = "<span>Your Worksheet Title Here...</span>";
        }
    });

    document.querySelector(".bld-nav-modal").addEventListener("mousedown", (e) => {
        if(!document.querySelector(".bld-nav").contains(e.target)){
            closeBldModal();
        }
    });
    function closeBldModal(){
        document.querySelector(".bld-nav-modal").style.opacity = "0";
        document.querySelector(".bld-nav-modal").style.pointerEvents = "none";
    }
    function openBldModal(){
        document.querySelector(".bld-nav-modal").style.opacity = "1";
        document.querySelector(".bld-nav-modal").style.pointerEvents = "auto";
    }
    function titleClick(){
        document.querySelector(".bld-input").focus();
        if(window.innerWidth <= 1310){
            openBldModal();
        }
    }

    function addBlankPage(){
        let newIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
        let newPage = document.createElement("div");
        newPage.classList.add("she-wrapper");
        newPage.classList.add("she-extra-page");
        let newInside = document.createElement("div");
        newInside.classList.add("she-wrapper-inside");
        let newPageNum = document.createElement("div");
        newPageNum.classList.add("she-idx");
        newPageNum.textContent = newIdx;
        let deleteIcon = document.createElement("div");
        deleteIcon.classList.add("she-delete");
        deleteIcon.style.cursor = "pointer";
        deleteIcon.innerHTML = `<i class="fa-solid fa-xmark she-delete"></i>`;
        newPage.appendChild(deleteIcon);
        document.querySelector(".she-container").appendChild(newPage);
        newPage.appendChild(newInside);
        newPage.appendChild(newPageNum);
        newPage.querySelector("div.she-delete").onclick = () => {
            document.querySelector(".she-container").removeChild(newPage);
            resetPageNumbers();
        }
    }
    function addLinedPage(){
        let newIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
        let newPage = document.createElement("div");
        newPage.classList.add("she-wrapper");
        newPage.classList.add("she-extra-page");
        newPage.innerHTML = `
            <div class="she-wrapper-inside">
                <img src="/images/print-lines.png" class="she-lines-img" />
            </div>
            <div class="she-idx">${newIdx}</div>
            <div class="she-delete" style="cursor: pointer;"><i class="fa-solid fa-xmark she-delete" aria-hidden="true"></i></div>
        `
        document.querySelector(".she-container").appendChild(newPage);
        newPage.querySelector("div.she-delete").onclick = () => {
            document.querySelector(".she-container").removeChild(newPage);
            resetPageNumbers();
        }
    }
    function saveSheet(){
        async function saveSheetData() {
            let subjectStr = parts[2].replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
            let fullDate = getCurrentDate();
            let isNew = true;
            let sheetId = false;
            if(params.get("sheet") || isSaved){
                isNew = false;
                sheetId = Number(params.get("sheet"));
            }
            if(document.querySelector(".btn-bld-active").textContent == "Worksheet"){
                sheetQuestionHtml = document.querySelector(".she-container").innerHTML;   
            }
            const dataToSend = { html: sheetQuestionHtml, title: document.getElementById("bldInput").value, subject: subjectStr, level: parts[3], cert: parts[1], date: fullDate, questionData: sheetQuestionImgs, schemeData: sheetSchemeImgs, sheetId: sheetId, isNew: isNew };
            try {
                const response = await fetch(url + '/api/save-sheet', {
                    method: 'POST',
                    
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend), 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    return;
                }

                const data = await response.json();
                if(data.message == "success"){
                    isSaved = true;
                    if(!params.get("sheet")){
                        params.set('sheet', data.newId);
                        const newUrl = window.location.pathname + '?' + params.toString();
                        window.history.replaceState({}, '', newUrl);
                        params = new URLSearchParams(window.location.search);
                    }
                    document.querySelector(".bld-li-save").style.display = "none";
                    document.querySelector(".bld-li-temp").style.display = "flex";
                    setTimeout(() => {
                        document.querySelector(".bld-li-save").style.display = "flex";
                        document.querySelector(".bld-li-temp").style.display = "none";
                    }, 2000);
                } else {
                    document.querySelector(".bld-li-save").style.display = "none";
                    document.querySelector(".bld-li-error").style.display = "flex";
                    setTimeout(() => {
                        document.querySelector(".bld-li-save").style.display = "flex";
                        document.querySelector(".bld-li-error").style.display = "none";
                    }, 2000);
                }
            } catch (error) {
                console.error('Error posting data:', error);
            }
        }
        saveSheetData();
    }

    document.querySelector(".bld-topic-inp").addEventListener("input", () => {
        let inpValue = document.querySelector(".bld-topic-inp").value.toLowerCase();
        document.querySelectorAll(".bld-topic-pill").forEach(topic => {
            if(topic.textContent.toLowerCase().includes(inpValue) || inpValue.length == 0){
                topic.style.display = "flex";
            } else {
                topic.style.display = "none";
            }
        });
    });

    function closeBldTopicModal(){
        document.querySelector(".bld-topic-modal").style.opacity = "0";
        document.querySelector(".bld-topic-modal").style.pointerEvents = "none";
    }
    document.querySelector(".bld-topic-modal").addEventListener("mousedown", (e) => {
        if(!document.querySelector(".bld-topic-wrapper").contains(e.target)){
            closeBldTopicModal();
        }
    });
    function openBldTopicModal(){
        scrollToTop(document.querySelector(".bld-topic-holder"));
        if(getComputedStyle(document.querySelector(".bld-nav-modal")).position == "fixed"){
            closeBldModal();
        }
        document.querySelector(".bld-topic-modal").style.opacity = "1";
        document.querySelector(".bld-topic-modal").style.pointerEvents = "auto";
        let certText = "lc";
        if(parts[1] == "junior-certificate"){
            certText = "jc";
        }
        fetch(`/topics/${certText}/${parts[2]}/${parts[3]}/${parts[2]}.json`) 
        .then(res => res.json())
        .then(data => {
            topics = data.topics;

            document.querySelector(".bld-topic-flex").innerHTML = "";
            data.topics.forEach(str => {
                let newPill = document.createElement("div");
                dynamicLightMode(newPill);
                newPill.classList.add("bld-topic-pill");
                newPill.textContent = str;
                newPill.addEventListener("click", () => document.querySelector(".btn-bld-topic.btn-reply").classList.remove("btn-inactive"));
                document.querySelector(".bld-topic-flex").appendChild(newPill);
            });
            clickOption(".bld-topic-pill", "bld-topic-pill-active");
        });
    }

    function closeBldQuesModal(){
        document.querySelector(".bld-ques-modal").style.opacity = "0";
        document.querySelector(".bld-ques-modal").style.pointerEvents = "none";
    }
    document.querySelector(".bld-ques-modal").addEventListener("mousedown", (e) => {
        if(!document.querySelector(".bld-ques-wrapper").contains(e.target)){
            closeBldQuesModal();
        }
    });
    clickOption(".bld-topic-pill", "bld-topic-pill-active");
    document.querySelectorAll(".bld-topic-pill").forEach(pill => {
        pill.addEventListener("click", () => document.querySelector(".btn-bld-topic.btn-reply").classList.remove("btn-inactive"));
    });
    function openBldQuesModal(){
        closeBldTopicModal();
        async function requestQuestions(){
            let certText = "lc";
            if(parts[1] == "junior-certificate"){
                certText = "jc";
            }
            const dataToSend = { cert: certText, subject: parts[2], level: parts[3], topic: document.querySelector(".bld-topic-pill-active").textContent.replace(/ /g, "-").replace(/&/g, "and").replace(/---/g, "-").replace(/--/g, "-").replace().replace(/,/g, "").replace(/\//g, "-").replace(/:/g, "").replace(/\?/g, "").replace(/\|/g, "").replace(/[#.+/'()]/g, "").toLowerCase() };
            try {
                const response = await fetch(url + '/api/worksheet-questions', {
                    method: 'POST',
                    
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend), 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    return;
                }

                const data = await response.json();
                const questions = data.questions.sort((a, b) => Number(b.year) - Number(a.year));
                if(data.message == "success"){
                    scrollToTop(document.querySelector(".bld-ques-container"));
                    document.querySelector(".bld-ques-col").innerHTML = "";
                    document.querySelector(".exam-eye-open").style.display = "block";
                    document.querySelector(".exam-eye-slash").style.display = "none";
                    document.querySelector(".scheme-img-container").style.maxHeight = "0px";
                    document.querySelector(".scheme-img-container").style.margin = "0";
                    document.querySelector(".bld-ques-modal").style.opacity = "1";
                    document.querySelector(".bld-ques-modal").style.pointerEvents = "auto";

                    let usedIds = [];
                    questions.forEach((question, idx) => {
                        let isUsed = false;
                        usedIds.forEach(usedId => {
                            if(usedId == question.id){
                                isUsed = true;
                            }
                        });

                        if(!isUsed && question.version == "question"){
                            usedIds.push(question.id);
                            let newBox = document.createElement("div");
                            newBox.classList.add("bld-ques-box");
                            let questionStr = ""
                            if(question.question){
                                questionStr = " - Question " + question.question.slice(1);
                            }
                            let questionType = "";
                            if(question.type == "mock"){
                                questionType = " sav-type-mock";
                            }
                            newBox.innerHTML = `
                                    <div class="bld-scheme-img-container" style="display: none;">
                                    </div>
                                    <div class="bld-ques-img-container">
                                    </div>
                                    <div class="sav-content">
                                        <div class="bld-ques-info">${question.year}${questionStr} - ${question.topic.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</div>
                                        <div class="sav-type${questionType}">${question.type.slice(0, 1).toUpperCase() + question.type.slice(1)} exam</div>
                                    </div>
                                    <div class="bld-ques-hr"></div>
                                    <div class="sav-btn-flex">
                                        <div class="btn-sav btn-remove">View</div>
                                        <div class="btn-sav btn-show">Add Question</div>
                                    </div>
                            `;
                            dynamicLightMode(newBox);
                            let newQuestionImgs = [question];
                            let newSchemeImgs = [];
                            let matchedObjs = [question];
                            let matchedSchemes = [];
                            questions.forEach((obj2, idx2) => {
                                if(idx2 != idx && obj2.year == question.year && obj2.option == question.option && obj2.part == question.part && obj2.question.slice(1) == question.question.slice(1) && obj2.type == question.type && obj2.version == question.version){
                                    usedIds.push(obj2.id);
                                    matchedObjs.push(obj2);
                                    newQuestionImgs.push(obj2);
                                }
                                if(idx2 != idx && obj2.year == question.year && obj2.option == question.option && obj2.part == question.part && obj2.question.slice(1) == question.question.slice(1) && obj2.type == question.type && obj2.version == "marking scheme"){
                                    matchedSchemes.push(obj2);
                                    newSchemeImgs.push(obj2);
                                }
                            });  
                            matchedObjs.forEach((el, idx) => {
                                matchedObjs.forEach((mtObj) => {
                                    if(mtObj.layer == (idx + 1)){
                                        let newQuestionImg = document.createElement("img");
                                        newQuestionImg.classList.add("bld-ques-img");
                                        newQuestionImg.dataset.src = mtObj.url;
                                        newBox.querySelector(".bld-ques-img-container").appendChild(newQuestionImg);
                                    }
                                });
                            });
                            matchedSchemes.forEach((el, idx) => {
                                matchedSchemes.forEach((mtObj) => {
                                    if(mtObj.layer == (idx + 1)){
                                        let newSchemeImg = document.createElement("img");
                                        newSchemeImg.classList.add("exam-scheme-img");
                                        newSchemeImg.dataset.src = mtObj.url;
                                        newBox.querySelector(".bld-scheme-img-container").appendChild(newSchemeImg);
                                    }
                                });
                            });
                            lazyObserver.observe(newBox);

                            newBox.querySelector(".btn-remove").onclick = () => { // view question
                                    console.log(newBox.querySelector(".exam-scheme-img").innerHTML);
                                    document.querySelector(".bld-ques-modal").style.opacity = "0";
                                    document.querySelector(".bld-ques-modal").style.pointerEvents = "none";
    
                                    document.querySelector(".preview-title").textContent = newBox.querySelector(".bld-ques-info").textContent;
                                    if(newBox.querySelector(".sav-type").classList.contains("sav-type-mock")){
                                        document.querySelector(".exam-type").classList.add("pap-type-mock");
                                        document.querySelector(".exam-type").textContent = "Mock Exam";
                                    } else {
                                        document.querySelector(".exam-type").classList.remove("pap-type-mock");
                                        document.querySelector(".exam-type").textContent = "State Exam";
                                        if(question.type == "deferred") document.querySelector(".exam-type").textContent = "State Exam";
                                    }
                                    document.querySelector(".exam-ques-container").innerHTML = newBox.querySelector(".bld-ques-img-container").innerHTML;
                                    document.querySelector(".scheme-img-container").innerHTML = newBox.querySelector(".bld-scheme-img-container").innerHTML;
                                    document.querySelector(".preview-modal").style.opacity = "1";
                                    document.querySelector(".preview-modal").style.pointerEvents = "auto";
                                    scrollToTop(document.querySelector(".preview-wrapper"));
                            }
                            newBox.querySelector(".btn-show").onclick = () => { // add question
                                newSchemeImgs = sortImgLayers(newSchemeImgs);
                                newQuestionImgs = newQuestionImgs.map(obj => obj.url);
                                newSchemeImgs = newSchemeImgs.map(obj => obj.url);                                
                                sheetSchemeImgs.push(newSchemeImgs);
                                sheetQuestionImgs.push(newQuestionImgs);
                                if(isFirstImg){
                                    isFirstImg = false;
                                    let firstContainer = document.querySelector(".she-img-container");
                                    firstContainer.innerHTML = newBox.querySelector(".bld-ques-img-container").innerHTML;
                                    firstContainer.querySelectorAll(".bld-ques-img").forEach(img => {
                                        img.classList.remove("bld-ques-img");
                                        img.classList.add("she-img");
                                    });
                                    let currentPage = "";
                                    let availableHeight = firstContainer.clientHeight;
                                    let currentHeight = 0;
                                    firstContainer.querySelectorAll(".she-img").forEach((img, idx) => {
                                        if(idx == 0){
                                            let deleteIcon = document.createElement("div");
                                            deleteIcon.classList.add("she-delete");
                                            deleteIcon.classList.add("she-img-delete");
                                            deleteIcon.style.cursor = "pointer";
                                            deleteIcon.innerHTML = `<i class="fa-solid fa-xmark she-delete she-img-delete" id="${img.src}"></i>`;
                                            dynamicLightMode(deleteIcon);
                                            document.querySelector(".she-wrapper").appendChild(deleteIcon);
                                            img.classList.add("she-first-img");
                                            document.querySelector(".she-container").addEventListener("click", (e) => {if(e.target.id == img.src){
                                                let previousTop = document.querySelector(".she-top").innerHTML;
                                                document.querySelectorAll(".she-wrapper").forEach(wrapper => {
                                                    newQuestionImgs.forEach(src => {
                                                        if(wrapper.querySelector(".she-img") && wrapper.querySelector(".she-img").src == src){
                                                            document.querySelector(".she-container").removeChild(wrapper);
                                                        }
                                                    });
                                                });
                                                if(!document.querySelector(".she-title")){
                                                    let secondWrapper;
                                                    document.querySelectorAll(".she-wrapper").forEach(downPage => {
                                                        if(!secondWrapper && downPage.querySelector(".she-img")){
                                                            secondWrapper = downPage;
                                                        }
                                                    });
                                                    if(secondWrapper){
                                                        let topHtml = document.createElement("div");
                                                        topHtml.classList.add("she-top");
                                                        topHtml.innerHTML = previousTop;
                                                        dynamicLightMode(topHtml);
                                                        secondWrapper.prepend(topHtml);
                                                        orderPages(secondWrapper);
                                                    } else {
                                                        let newFirstWrapper = document.createElement("div");
                                                        newFirstWrapper.classList.add("she-wrapper");
                                                        newFirstWrapper.innerHTML = `
                                                            <div class="she-wrapper-inside">
                                                                <div class="she-top">
                                                                    ${previousTop}
                                                                </div>
                                                                
                                                                <div class="she-img-container">
                                                                </div>
                                                            </div>
                                                            <div class="she-idx">1</div>
                                                        `
                                                        dynamicLightMode(newFirstWrapper);
                                                        document.querySelector(".she-container").prepend(newFirstWrapper);
                                                        isFirstImg = true;
                                                    }
                                                }
                                                if(newSchemeImgs[0]){
                                                    sheetSchemeImgs = sheetSchemeImgs.filter(srcSet => !srcSet.includes(newSchemeImgs[0]));
                                                }
                                                if(newQuestionImgs[0]){
                                                    sheetQuestionImgs = sheetQuestionImgs.filter(srcSet => !srcSet.includes(newQuestionImgs[0]));
                                                }
                                                resetPageNumbers();
                                            }});
                                        }

                                        currentHeight += img.clientHeight;
                                        if(currentPage != "" && currentHeight <= availableHeight){
                                            currentPage.querySelector(".she-img-container").appendChild(img);
                                        }
                                        if(currentHeight > availableHeight){
                                            currentHeight = img.clientHeight;
                                            let nextIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                                            currentPage = document.createElement("div");
                                            currentPage.classList.add("she-wrapper");
                                            currentPage.innerHTML = `
                                                <div class="she-wrapper-inside">
                                                    <div class="she-img-container">
                                                        ${img.outerHTML}
                                                    </div>
                                                </div>
                                                <div class="she-idx">${nextIdx}</div>
                                            `
                                            dynamicLightMode(currentPage);
                                            if(document.querySelector(".she-extra-page")){
                                                document.querySelector(".she-container").insertBefore(currentPage, document.querySelector(".she-extra-page"));
                                            } else {
                                                document.querySelector(".she-container").appendChild(currentPage);
                                            }
                                            firstContainer.removeChild(img);
                                        }
                                    });
                                } else { 
                                    let newIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                                    let newPage = document.createElement("div");
                                    newPage.classList.add("she-wrapper");
                                    newPage.innerHTML = `
                                    <div class="she-wrapper-inside">
                                    <div class="she-img-container">
                                    ${newBox.querySelector(".bld-ques-img-container").innerHTML}
                                    </div>
                                    </div>
                                    <div class="she-idx">${newIdx}</div>
                                    `
                                    dynamicLightMode(newPage);
                                    let currentPage = "";
                                    document.querySelector(".she-container").appendChild(newPage);
                                    newPage.querySelectorAll(".bld-ques-img").forEach((img, idx) => {
                                        img.classList.remove("bld-ques-img");
                                        img.classList.add("she-img");
                                    });
                                    let availableHeight = newPage.querySelector(".she-img-container").clientHeight;
                                    let currentHeight = 0;
                                    newPage.querySelectorAll(".she-img").forEach((img, idx) => {
                                        if(idx == 0){
                                            let deleteIcon = document.createElement("div");
                                            deleteIcon.classList.add("she-delete");
                                            deleteIcon.style.cursor = "pointer";
                                            deleteIcon.innerHTML = `<i class="fa-solid fa-xmark she-delete" id="${img.src}"></i>`;
                                            dynamicLightMode(deleteIcon);
                                            newPage.appendChild(deleteIcon);
                                            img.classList.add("she-first-img");
                                            document.querySelector(".she-container").addEventListener("click", (e) => {if(e.target.id == img.src){
                                                let previousTop = document.querySelector(".she-top").innerHTML;
                                                document.querySelectorAll(".she-wrapper").forEach(wrapper => {
                                                    newQuestionImgs.forEach(src => {
                                                        if(wrapper.querySelector(".she-img") && wrapper.querySelector(".she-img").src == src){
                                                            document.querySelector(".she-container").removeChild(wrapper);
                                                        }
                                                    });
                                                });
                                                if(!document.querySelector(".she-title")){
                                                    let secondWrapper;
                                                    document.querySelectorAll(".she-wrapper").forEach(downPage => {
                                                        if(!secondWrapper && downPage.querySelector(".she-img")){
                                                            secondWrapper = downPage;
                                                        }
                                                    });
                                                    if(secondWrapper){
                                                        let topHtml = document.createElement("div");
                                                        topHtml.classList.add("she-top");
                                                        topHtml.innerHTML = previousTop;
                                                        dynamicLightMode(topHtml);
                                                        secondWrapper.prepend(topHtml);
                                                        orderPages(secondWrapper);
                                                    } else {
                                                        let newFirstWrapper = document.createElement("div");
                                                        newFirstWrapper.classList.add("she-wrapper");
                                                        newFirstWrapper.innerHTML = `
                                                            <div class="she-wrapper-inside">
                                                                <div class="she-top">
                                                                    ${previousTop}
                                                                </div>
                                                                
                                                                <div class="she-img-container">
                                                                </div>
                                                            </div>
                                                            <div class="she-idx">1</div>
                                                        `
                                                        dynamicLightMode(newFirstWrapper);
                                                        document.querySelector(".she-container").prepend(newFirstWrapper);
                                                        isFirstImg = true;
                                                    }
                                                }
                                                if(newSchemeImgs[0]){
                                                    sheetSchemeImgs = sheetSchemeImgs.filter(srcSet => !srcSet.includes(newSchemeImgs[0]));
                                                }
                                                if(newQuestionImgs[0]){
                                                    sheetQuestionImgs = sheetQuestionImgs.filter(srcSet => !srcSet.includes(newQuestionImgs[0]));
                                                }
                                                resetPageNumbers();
                                            }});
                                        } 

                                        currentHeight += img.clientHeight;
                                        if(currentPage != "" && currentHeight <= availableHeight){
                                            currentPage.querySelector(".she-img-container").appendChild(img);
                                        }
                                        if(currentHeight > availableHeight){
                                            currentHeight = img.clientHeight;
                                            let nextIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                                            currentPage = document.createElement("div");
                                            currentPage.classList.add("she-wrapper");
                                            currentPage.innerHTML = `
                                                <div class="she-wrapper-inside">
                                                    <div class="she-img-container">
                                                        ${img.outerHTML}
                                                    </div>
                                                </div>
                                                <div class="she-idx">${nextIdx}</div>
                                            `
                                            dynamicLightMode(currentPage);
                                            document.querySelector(".she-container").appendChild(currentPage);
                                            newPage.querySelector(".she-img-container").removeChild(img);
                                        }
                                    });
                                }
                                resetPageNumbers();
                            }

                            document.querySelector(".bld-ques-col").appendChild(newBox);
                        }
                    });
                }
            } catch (error) {
                console.error('Error posting data:', error);
            }
        }
        requestQuestions();
    }

    function showSheetQues(){
        document.querySelectorAll(".bld-edit-elements").forEach(element => element.classList.remove("bld-nav-inactive"));
        let currentTitle = document.querySelector(".she-title").innerHTML;
        document.querySelector(".she-container").innerHTML = sheetQuestionHtml;
        document.querySelector(".she-title").innerHTML = currentTitle;
        document.querySelectorAll(".she-extra-page").forEach(page => {
            page.querySelector("div.she-delete").onclick = () => {
                document.querySelector(".she-container").removeChild(page);
                resetPageNumbers();
            }
        });
    }
    function showSheetScheme(){
        document.querySelectorAll(".bld-edit-elements").forEach(element => element.classList.add("bld-nav-inactive"));
        sheetQuestionHtml = document.querySelector(".she-container").innerHTML;
        let currentTitle = document.querySelector(".she-title").innerHTML;
        document.querySelector(".she-container").innerHTML = "";
        let firstWrapper = document.createElement("div");
        firstWrapper.classList.add("she-wrapper");
        firstWrapper.innerHTML = `
            <div class="she-wrapper-inside">
                <div class="she-top">
                    <div class="she-title" onclick="titleClick()">${currentTitle}</div>
                </div>

                <div class="she-img-container">
                </div>

            </div>
            <div class="she-idx">1</div>
        `
        dynamicLightMode(firstWrapper);
        document.querySelector(".she-container").appendChild(firstWrapper);
        sheetSchemeImgs.forEach((question, idx) => {
            if(idx == 0){
                let currentPage = "";
                let availableHeight = firstWrapper.querySelector(".she-img-container").clientHeight;
                let currentHeight = 0;
                question.forEach(url => {
                    let urlImg = document.createElement("img");
                    urlImg.classList.add("she-img");
                    urlImg.src = url;
                    firstWrapper.querySelector(".she-img-container").appendChild(urlImg);
                    setTimeout(() => {
                        currentHeight += urlImg.clientHeight;
                        if(currentPage != "" && currentHeight <= availableHeight){
                            currentPage.querySelector(".she-img-container").appendChild(img);
                        }
                        if(currentHeight > availableHeight){
                            currentHeight = urlImg.clientHeight;
                            let nextIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                            currentPage = document.createElement("div");
                            currentPage.classList.add("she-wrapper");
                            currentPage.innerHTML = `
                                <div class="she-wrapper-inside">
                                    <div class="she-img-container">
                                        ${urlImg.outerHTML}
                                    </div>
                                </div>
                                <div class="she-idx">${nextIdx}</div>
                            `
                            dynamicLightMode(currentPage);
                            document.querySelector(".she-container").appendChild(currentPage);
                            firstWrapper.querySelector(".she-img-container").removeChild(urlImg);
                        }
                    }, 500);
                });
            } else {
                let newIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                let newPage = document.createElement("div");
                newPage.classList.add("she-wrapper");
                newPage.innerHTML = `
                    <div class="she-wrapper-inside">
                    <div class="she-img-container">
                    </div>
                    </div>
                    <div class="she-idx">${newIdx}</div>
                `
                dynamicLightMode(newPage);
                let currentPage = "";
                document.querySelector(".she-container").appendChild(newPage);
                let availableHeight = newPage.querySelector(".she-img-container").clientHeight;
                let currentHeight = 0;
                question.forEach(url => {
                    let urlImg = document.createElement("img");
                    urlImg.classList.add("she-img");
                    urlImg.src = url;
                    newPage.querySelector(".she-img-container").appendChild(urlImg);
                    setTimeout(() => {
                        currentHeight += urlImg.clientHeight;
                        console.log(currentHeight);
                        if(currentPage != "" && currentHeight <= availableHeight){
                            currentPage.querySelector(".she-img-container").appendChild(img);
                        }
                        if(currentHeight > availableHeight){
                            currentHeight = urlImg.clientHeight;
                            let nextIdx = document.querySelector(".she-container").querySelectorAll(".she-wrapper").length + 1;
                            currentPage = document.createElement("div");
                            currentPage.classList.add("she-wrapper");
                            currentPage.innerHTML = `
                                <div class="she-wrapper-inside">
                                    <div class="she-img-container">
                                        ${urlImg.outerHTML}
                                    </div>
                                </div>
                                <div class="she-idx">${nextIdx}</div>
                            `
                            dynamicLightMode(currentPage);
                            document.querySelector(".she-container").appendChild(currentPage);
                            newPage.querySelector(".she-img-container").removeChild(urlImg);
                        }
                    }, 500);
                });
            }
        });
    }
    function resetPageNumbers(){
        document.querySelectorAll(".she-idx").forEach((txt, idx) => {
            txt.textContent = idx + 1;
        });
    }
    function orderPages(lowWrapper){
        let oldFirstWrapper = document.querySelector(".she-wrapper");
        document.querySelector(".she-container").insertBefore(lowWrapper, oldFirstWrapper);
        sheetQuestionImgs.forEach(srcSet => {
            if(srcSet.includes(lowWrapper.querySelector(".she-img").src)){
                let isFirstMatch = true;
                let prevPage;
                document.querySelectorAll(".she-wrapper").forEach(page => {
                    if(page.querySelector(".she-img") && page != lowWrapper && srcSet.includes(page.querySelector(".she-img").src)){
                        if(isFirstMatch){
                            document.querySelector(".she-container").insertBefore(page, lowWrapper.nextSibling);
                            isFirstMatch = false;
                            prevPage = page;
                        } else {
                            document.querySelector(".she-container").insertBefore(page, prevPage.nextSibling);
                        }
                    }
                });
            }
        });
    }

    document.querySelector(".preview-modal").addEventListener("mousedown", (e) => {
        if(!document.querySelector(".preview-wrapper").contains(e.target)) {
            closePreviewModal();
        }
    });
    function closePreviewModal(){
        document.querySelector(".preview-modal").style.opacity = "0";
        document.querySelector(".preview-modal").style.pointerEvents = "none";
        document.querySelector(".bld-ques-modal").style.opacity = "1";
        document.querySelector(".bld-ques-modal").style.pointerEvents = "auto";
        document.querySelector(".exam-eye-open").style.display = "block";
        document.querySelector(".exam-eye-slash").style.display = "none";
        document.querySelector(".scheme-img-container").style.maxHeight = "0px";
        document.querySelector(".scheme-img-container").style.margin = "0";
    }
    document.querySelector(".btn-view").onclick = () => {
        let autoHeight = 0;
        document.querySelector(".scheme-img-container").querySelectorAll(".exam-scheme-img").forEach(img => {
            autoHeight = autoHeight + img.clientHeight;
        });
        if(document.querySelector(".scheme-img-container").style.maxHeight.includes("calc")){
            document.querySelector(".exam-eye-open").style.display = "block";
            document.querySelector(".exam-eye-slash").style.display = "none";
            document.querySelector(".scheme-img-container").style.maxHeight = "0px";
            document.querySelector(".scheme-img-container").style.margin = "0";
        } else {
            document.querySelector(".exam-eye-open").style.display = "none";
            document.querySelector(".exam-eye-slash").style.display = "block";
            document.querySelector(".scheme-img-container").style.maxHeight = "calc(" + autoHeight + "px + 30px)";
            document.querySelector(".scheme-img-container").style.margin = "15px 0";
        }
    }
}

if(document.querySelector(".sash-table")){
    async function getUserSheets() {
        try {
            const response = await fetch(url + `/api/get-sheets`, {
                method: 'GET',
                
            });
            const data = await response.json();
            const sheets = data.sheets;
            if(data.message == "success"){
                sheets.forEach(sheet => {
                    let subjectSlug = sheet.subject.replace(/ /g, "-").toLowerCase();
                    let level = "Higher";
                    if(sheet.level == "ol"){
                        level = "Ordinary";
                    } else if(sheet.level == "cl"){
                        level = "Common";
                    }
    
                    let newRow = document.createElement("div");
                    newRow.classList.add("sash-row");
                    newRow.innerHTML = `
                        <a href="${frontendLink}/worksheets/${sheet.certificate}/${subjectSlug}/${sheet.level}?sheet=${sheet.id}" class="sash-name-col">
                            <div class="sash-txt sash-name">${sheet.title}</div>
                        </a>
                        <div class="pap-year-col">
                            <div class="sash-txt">${sheet.subject}</div>
                        </div>
                        <div class="pap-year-col">
                            <div class="sash-level sash-${sheet.level}">${level}</div>
                        </div>
                        <div class="pap-year-col">
                            <div class="sash-txt">${sheet.last_edited}</div>
                        </div>
                        <div class="pap-year-col">
                            <div class="btn-sash-del">Delete</div>
                        </div>
                    `
                    dynamicLightMode(newRow);
                    document.querySelector(".sash-inside").appendChild(newRow);

                    newRow.querySelector(".btn-sash-del").onclick = () => {
                        async function deleteSheet() {
                            const dataToSend = { sheetId: sheet.id };
                            try {
                                const response = await fetch(url + '/api/delete-sheet', {
                                    method: 'POST',
                                    
                                    headers: {
                                        'Content-Type': 'application/json', 
                                    },
                                    body: JSON.stringify(dataToSend), 
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error('Error:', errorData.message);
                                    return;
                                }

                                const data = await response.json();
                                if(data.message == "success"){
                                    document.querySelector(".sash-inside").removeChild(newRow);
                                    if(!document.querySelector(".sash-row")){
                                        document.querySelector(".sash-table").style.display = "none";
                                        document.querySelector(".sav-empty").style.display = "flex";
                                    }
                                }
                            } catch (error) {
                                console.error('Error posting data:', error);
                            }
                        }
                        deleteSheet();
                    }
                });
            } else {
                document.querySelector(".sash-table").style.display = "none";
                document.querySelector(".sav-empty").style.display = "flex";
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getUserSheets();
}

if(document.querySelector(".log-rem")){
    document.querySelector(".log-rem-box").addEventListener("click", () => {
        if(isRemembered){
            document.querySelector(".log-rem-box").classList.remove("log-box-active");
            isRemembered = false;
        } else {
            document.querySelector(".log-rem-box").classList.add("log-box-active");
            isRemembered = true;
        }
    });
}

if(document.querySelector(".use-container")){
    document.querySelectorAll(".log-box").forEach(box => {
        box.addEventListener("click", () => {
            if(box.classList.contains("use-box-active")){
                box.classList.remove("use-box-active");
                box.querySelector(".log-box-check").classList.remove("log-box-check-active");
                if(!document.querySelector(".use-box-active")){
                    document.querySelector(".use-container").querySelector(".btn-onboard").classList.add("btn-inactive");
                }
            } else {
                document.querySelector(".use-container").querySelector(".btn-onboard").classList.remove("btn-inactive");
                box.classList.add("use-box-active");
                box.querySelector(".log-box-check").classList.add("log-box-check-active");
            }
        });
    });
}

if(document.querySelector(".set-container")){
    document.querySelectorAll(".side-section").forEach(section => {
        section.classList.remove("active-section");
        if(section.classList.contains("settings-section")){
            section.classList.add("active-section");
        }
    });

    if(params.get("section") && params.get("section") == "subjects"){
        document.querySelectorAll(".set-nav-section").forEach(sect => {
            sect.classList.remove("set-nav-active");
            if(sect.textContent == "My Subjects"){
                sect.classList.add("set-nav-active");
            }
        });
        document.querySelectorAll(".set-content").forEach(sect => {
            sect.style.display = "none";
            if(sect.classList.contains("set-subjects")){
                sect.style.display = "block";
            }
        });
        if(params.get("edit")){
            document.querySelector(".set-change-modal").style.opacity = "1";
            document.querySelector(".set-change-modal").style.pointerEvents = "auto";
        }
    }

    let userData;
    async function getUserData() {
        try {
            const response = await fetch(url + `/api/settings-data`, {
                method: 'GET',
                
            });
            const data = await response.json(); 

            if(data.message == "success"){
                userData = data.userData;
                const subjectData = data.subjectData;

                document.getElementById("setName").textContent = userData.student_name;
                document.getElementById("setUsername").textContent = userData.username;
                document.getElementById("setAccountType").textContent = userData.role.slice(0, 1).toUpperCase() + userData.role.slice(1);
                document.getElementById("setEmail").textContent = userData.email;
                subjectData.forEach((subject, idx) => {
                    if(idx == 0){
                        if(subject.certificate_type == "jc"){
                            document.getElementById("setYear").textContent = "Junior cert";
                            document.querySelectorAll(".edit-top-selector")[0].classList.add("edit-selector-inactive");
                            document.querySelector(".edit-pill-active").classList.remove("edit-pill-active");
                            document.querySelectorAll(".edit-pill")[1].classList.add("edit-pill-active");
                        } else {
                            document.getElementById("setYear").textContent = "Leaving cert";
                            document.querySelectorAll(".edit-top-selector")[1].classList.add("edit-selector-inactive");
                        }
                    }

                    let newSubject = document.createElement("div");
                    newSubject.classList.add("edit-view-txt");
                    let levelTxt = "";
                    if(subject.level == "hl"){
                        levelTxt = "Higher ";
                    } else if(subject.level == "ol"){
                        levelTxt = "Ordinary ";
                    }
                    let subName = subject.subject_name.replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                    newSubject.innerHTML = `${levelTxt}${subName}<i class="fa-solid fa-xmark edit-view-xmark"></i>`;
                    dynamicLightMode(newSubject);
                    if(subject.level == "cl"){
                        levelTxt = "Common";
                    }
                    newSubject.id = `${(subName + "_").replace(/ /g, "-").replace("-_", "_").replace(/-$/, "")}${levelTxt.replace(/ /g, "")}`;
                    document.querySelector(".edit-view-col").appendChild(newSubject);  
                    checkAllSubjects();  
                    newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                        e.stopPropagation();
                        document.querySelector(".edit-view-col").removeChild(newSubject);
                        checkAllSubjects();
                    };

                    let subLevel = "Higher level";
                    if(subject.level == "ol"){
                        subLevel = "Ordinary Level";
                    } else if(subject.level == "cl"){
                        subLevel = "Common Level";
                    }
                    let newLi = document.createElement("div");
                    newLi.classList.add("set-li");
                    newLi.classList.add("set-li-exist");
                    if(subject.level == "hl" || subject.level == "ol"){
                        newLi.innerHTML = `
                                    <div class="set-col">
                                        <div class="set-bold set-subject">${subject.subject_name.slice(0, 1).toUpperCase() + subject.subject_name.slice(1).replace(/-/g, " ")}</div>
                                        <div class="set-txt set-level">${subLevel}</div>
                                    </div>
                                    <div class="btn-set btn-edit-sub">Edit <i class="fa-solid fa-pen-to-square set-icon"></i>
                                        <div class="set-drop">
                                            <div class="sub-drop-section">
                                                <div class="sub-drop-box set-level-box"><i class="fa-solid fa-check sub-drop-check set-level-check"></i></div>
                                                <div class="sub-drop-txt">Higher level</div>
                                            </div>
                                            <div class="sub-drop-section">
                                                <div class="sub-drop-box set-level-box"><i class="fa-solid fa-check sub-drop-check set-level-check"></i></div>
                                                <div class="sub-drop-txt">Ordinary level</div>
                                            </div>
                                            <div class="sub-drop-hr"></div>
                                            <div class="sub-drop-section sub-rem">
                                                <i class="fa-solid fa-trash sub-drop-icon red"></i>
                                                <div class="sub-drop-txt red">Remove subject</div>
                                            </div>
                                            <div class="sub-drop-section sub-rem set-sub-add">
                                                <i class="fa-solid fa-plus sub-drop-icon"></i>
                                                <div class="sub-drop-txt">Add a subject</div>
                                            </div>
                                        </div>
                                    </div>
                        `
                        if(subject.level == "hl"){
                            newLi.querySelectorAll(".set-level-box")[0].classList.add("sub-drop-box-active");
                            newLi.querySelectorAll(".set-level-check")[0].classList.add("sub-drop-check-active");
                        } else {
                            newLi.querySelectorAll(".set-level-box")[1].classList.add("sub-drop-box-active");
                            newLi.querySelectorAll(".set-level-check")[1].classList.add("sub-drop-check-active");
                        }
                    } else {
                        newLi.innerHTML = `
                                    <div class="set-col">
                                        <div class="set-bold set-subject">${subject.subject_name.slice(0, 1).toUpperCase() + subject.subject_name.slice(1).replace(/-/g, " ")}</div>
                                        <div class="set-txt set-level">${subLevel}</div>
                                    </div>
                                    <div class="btn-set btn-edit-sub">Edit <i class="fa-solid fa-pen-to-square set-icon"></i>
                                        <div class="set-drop">
                                            <div class="sub-drop-section sub-rem">
                                                <i class="fa-solid fa-trash sub-drop-icon red"></i>
                                                <div class="sub-drop-txt red">Remove subject</div>
                                            </div>
                                            <div class="sub-drop-section sub-rem set-sub-add">
                                                <i class="fa-solid fa-plus sub-drop-icon"></i>
                                                <div class="sub-drop-txt">Add a subject</div>
                                            </div>
                                        </div>
                                    </div>
                        `
                    }
                    dynamicLightMode(newLi);

                    newLi.querySelectorAll(".set-level-box").forEach((box, idx) => {
                        box.addEventListener("click", () => {if(!box.classList.contains("sub-drop-box-active")){
                            newLi.querySelectorAll(".set-level-box").forEach(other => {
                                other.classList.remove("sub-drop-box-active");
                                other.querySelector(".set-level-check").classList.remove("sub-drop-check-active");
                            });
                            box.classList.add("sub-drop-box-active");
                            box.querySelector(".set-level-check").classList.add("sub-drop-check-active");
                            newLi.querySelector(".set-level").textContent = "Higher Level";
                            if(idx == 1){
                                newLi.querySelector(".set-level").textContent = "Ordinary Level";
                            }
                            async function updateLevel() {
                                const dataToSend = { id: subject.id, levelIdx: idx };
                                try {
                                    const response = await fetch(url + '/api/update-level', {
                                        method: 'POST',
                                        
                                        headers: {
                                            'Content-Type': 'application/json', 
                                        },
                                        body: JSON.stringify(dataToSend), 
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('Error:', errorData.message);
                                        return;
                                    }

                                    const data = await response.json();
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                }
                            }
                            updateLevel();
                        }});
                    });
                    newLi.querySelector(".sub-rem").addEventListener("click", () => {
                        async function deleteSubject() {
                            const dataToSend = { id: subject.id };
                            try {
                                const response = await fetch(url + '/api/remove-subject', {
                                    method: 'POST',
                                    
                                    headers: {
                                        'Content-Type': 'application/json', 
                                    },
                                    body: JSON.stringify(dataToSend), 
                                });

                                if (!response.ok) {
                                    const errorData = await response.json();
                                    console.error('Error:', errorData.message);
                                    return;
                                }

                                const data = await response.json();
                                if(data.message == "success"){
                                    newLi.style.display = "none";
                                    newLi.classList.remove("set-li-exist");
                                    if(document.querySelectorAll(".set-li-exist").length == 1){
                                        document.querySelector(".sub-rem").style.display = "none";
                                    }
                                }
                            } catch (error) {
                                console.error('Error posting data:', error);
                            }
                        }
                        deleteSubject();
                    });

                    if(subjectData.length == 1){
                        newLi.querySelector(".sub-rem").style.display = "none";
                    }

                    document.querySelector(".set-subjects").appendChild(newLi);
                });

                document.querySelectorAll(".btn-edit-sub").forEach((btn, idx) => {
                    btn.addEventListener("click", () => {
                        document.querySelectorAll(".set-drop")[idx].style.pointerEvents = "auto";
                        document.querySelectorAll(".set-drop")[idx].style.opacity = "1";
                    });
                });
                document.querySelectorAll(".set-nav-link").forEach((section, idx) => {
                    section.addEventListener("click", () => {
                        document.querySelectorAll(".set-nav-link").forEach(old => {
                            old.classList.remove("set-nav-active");
                        });
                        section.classList.add("set-nav-active");

                        document.querySelectorAll(".set-content").forEach((cont, contIdx) => {
                            cont.style.opacity = "0";
                            setTimeout(() => {
                                cont.style.display = "none";
                                if(contIdx == idx){
                                cont.style.display = "block";
                                
                                setTimeout(() => {
                                    cont.style.opacity = "1";
                                    }, 30);
                                }
                            }, 150);
                        });
                    });
                });
                document.querySelector(".set-change-modal").addEventListener("mousedown", (e) => {
                    if(!document.querySelector(".set-change-wrapper").contains(e.target)){
                        document.querySelector(".set-change-modal").style.opacity = "0";
                        document.querySelector(".set-change-modal").style.pointerEvents = "none";
                    }
                });
                document.querySelector(".set-act-modal").addEventListener("mousedown", (e) => {
                    if(!document.querySelector(".set-act-wrapper").contains(e.target)){
                        document.querySelector(".set-act-modal").style.opacity = "0";
                        document.querySelector(".set-act-modal").style.pointerEvents = "none";
                    }
                });
                document.querySelector(".set-change-exit").addEventListener("click", () => {
                    document.querySelector(".set-change-modal").style.opacity = "0";
                    document.querySelector(".set-change-modal").style.pointerEvents = "none";
                });
                document.querySelector(".set-act-exit").addEventListener("click", () => {
                    document.querySelector(".set-act-modal").style.opacity = "0";
                    document.querySelector(".set-act-modal").style.pointerEvents = "none";
                }); 
                document.querySelectorAll(".set-sub-add, .btn-set-all").forEach(rem => {
                    rem.addEventListener("click", () => {
                        document.querySelector(".set-change-modal").style.opacity = "1";
                        document.querySelector(".set-change-modal").style.pointerEvents = "auto";
                    });
                });
            } else if(data.message == "no user"){
                console.log("NO USER FOUND");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    getUserData();

    function changeSettings(idx){
        settingsIdx = idx;
        document.querySelector(".set-act-modal").style.pointerEvents = "auto";
        document.querySelector(".set-act-modal").style.opacity = "1";
        document.querySelector("span.set-act-label").textContent = settingsData[idx].ui;
        document.querySelector(".set-act-head").textContent = userData[settingsData[idx].db];
        if(!userData[settingsData[idx].db]){
            document.querySelector(".set-act-head").textContent = "****************";
        }
        document.querySelector("span.set-act-guide").textContent = settingsData[idx].ui;
        document.querySelector(".set-act-input").setAttribute("placeholder", settingsData[idx].ui.slice(0, 1).toUpperCase() + settingsData[idx].ui.slice(1));
        document.querySelector(".btn-act-continue").onclick = requestChange;
    }
    async function requestChange() {
        if(document.querySelector(".set-act-input").value.length > 0){
            const dataToSend = { data: settingsData[settingsIdx], value: document.querySelector(".set-act-input").value };
            try {
                const response = await fetch(url + '/api/settings-change', {
                    method: 'POST',
                    
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend), 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    return;
                }

                const data = await response.json();
                if(data.message == "success"){
                    closeSetModal();
                    document.getElementById("thankStr").textContent = settingsData[settingsIdx].ui;
                    document.querySelector(".set-thank-modal").style.opacity = "1";
                    document.querySelector(".set-thank-modal").style.pointerEvents = "auto";
                } else if(data.message == "verify"){
                    closeSetModal();
                    document.querySelector(".set-ver-modal").style.opacity = "1";
                    document.querySelector(".set-ver-modal").style.pointerEvents = "auto";
                    document.querySelectorAll(".ver-inp-container input")[0].focus();
                } else {
                    document.getElementById("setError").textContent = data.message;
                    document.getElementById("setError").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("setError").style.display = "none";
                    }, 2000);
                }
            } catch (error) {
                console.error('Error posting data:', error);
            }
        } else {
            document.getElementById("setError").textContent = "Please enter a valid " + settingsData[settingsIdx].ui;
            document.getElementById("setError").style.display = "block";
            setTimeout(() => {
                document.getElementById("setError").style.display = "none";
            }, 2000);
        }
    }
    function closeSetModal(){
        document.querySelector(".set-act-modal").style.opacity = "0";
        document.querySelector(".set-act-modal").style.pointerEvents = "none";
    }

    function deleteAccount(real){
        if(real){
            async function requestDelete() {
                try {
                    const response = await fetch(`${url}/api/delete-account`, {
                        method: 'GET',
                        
                    });
                    const data = await response.json(); 
                    if(data.message == "success"){
                        window.location.href = "/login";
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
            requestDelete();
        } else {
            document.getElementById("deleteModal").style.opacity = "1";
            document.getElementById("deleteModal").style.pointerEvents = "auto";
        }
    }
}

/* EDIT SUBJECTS, REGISTER AND SETTINGS */
if(document.querySelector(".edit-container") || document.querySelector(".set-container")){
    clickOption(".edit-pill", "edit-pill-active");
    document.querySelectorAll(".edit-pill").forEach((pill, idx) => {
        pill.addEventListener("click", () => {
            let htmlFound = false;
            let otherIdx = 1;
            if(idx == 1) otherIdx = 0;
            subjectHtml[otherIdx] = document.querySelector(".edit-view-col").innerHTML;
            if(subjectHtml[idx] != ""){
                htmlFound = true;
                document.querySelector(".edit-view-col").innerHTML = subjectHtml[idx];
                document.querySelectorAll(".edit-view-txt").forEach(newSubject => { 
                    newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                        e.stopPropagation();
                        document.querySelector(".edit-view-col").removeChild(newSubject);
                        checkAllSubjects();
                    };
                });
            }
            if(htmlFound){
                checkAllSubjects();
            } else {
                document.querySelector(".edit-view-head").textContent = "Your subjects (0)";
                document.querySelectorAll(".edit-view-txt").forEach(txt => {
                    document.querySelector(".edit-view-col").removeChild(txt);
                    resetCircles();
                });
                document.querySelectorAll(".edit-circle-active").forEach(circle => {
                    circle.classList.remove("edit-circle-active");
                });
            }
            document.querySelectorAll(".edit-top-selector").forEach((top, topIdx) => {
                if(topIdx != idx && !top.classList.contains("edit-search-selector")){
                    top.classList.add("edit-selector-inactive");
                    top.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(0deg)";
                    top.querySelector(".edit-ul").style.display = "none";
                    top.style.display = "block";
                } else if(!top.classList.contains("edit-search-selector")) {
                    top.style.display = "block";
                    top.classList.remove("edit-selector-inactive");
                } else {
                    top.style.display = "none";
                }
            });
        });
    });

    document.querySelectorAll(".edit-selector").forEach(cont => {
        cont.querySelector(".edit-selector-txt").addEventListener("click", () => {
            if(cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform == "rotate(-180deg)"){
                cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(0deg)";
                cont.querySelector(".edit-ul").style.display = "none";
                cont.querySelector(".edit-ul").querySelectorAll(".edit-selector, .edit-level").forEach(selector => {
                    selector.style.opacity = "0";
                });
            } else {
                cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(-180deg)";
                cont.querySelector(".edit-ul").style.display = "block";
                setTimeout(() => {
                    if(cont.classList.contains("edit-top-selector")){
                        cont.querySelector(".edit-ul").querySelectorAll(".edit-selector").forEach(selector => {
                            selector.style.opacity = "1";
                        });   
                    } else {
                        cont.querySelector(".edit-ul").querySelectorAll(".edit-selector, .edit-level").forEach(selector => {
                            selector.style.opacity = "1";
                        });
                    }
                }, 10);
            }
        });
    });
    document.querySelectorAll(".edit-auto").forEach(cont => {
        cont.addEventListener("click", () => {
            if(cont.querySelector(".edit-circle").classList.contains("edit-circle-active")){
                cont.querySelector(".edit-circle").classList.remove("edit-circle-active");

                document.querySelectorAll(".edit-view-txt").forEach(col => {
                    if(col.textContent == cont.querySelector(".edit-auto-txt").textContent){
                        document.querySelector(".edit-view-col").removeChild(col);
                        checkAllSubjects();
                    }
                });
            } else {
                cont.querySelector(".edit-circle").classList.add("edit-circle-active");

                let newSubject = document.createElement("div");
                newSubject.classList.add("edit-view-txt");
                newSubject.innerHTML = `${cont.querySelector(".edit-auto-txt").textContent}<i class="fa-solid fa-xmark edit-view-xmark"></i>`;
                dynamicLightMode(newSubject);
                newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                    e.stopPropagation();
                    document.querySelector(".edit-view-col").removeChild(newSubject);
                    checkAllSubjects();
                };
                newSubject.id = `${cont.querySelector(".edit-auto-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "")}_Common`;
                let textFound = false;
                document.querySelectorAll(".edit-view-txt").forEach(text => {
                    if(text.innerHTML == cont.querySelector(".edit-auto-txt").textContent){
                        textFound = true;
                    }
                });
                if(!textFound){
                    document.querySelector(".edit-view-col").appendChild(newSubject);
                    checkAllSubjects();
                }
            }
            document.querySelector(".edit-view-head").textContent = "Your subjects (" + document.querySelectorAll(".edit-view-txt").length + ")";
        });
    });
    document.querySelectorAll(".edit-selector").forEach(cont => {if(!cont.classList.contains("edit-top-selector")){
        cont.querySelectorAll(".edit-level").forEach((level, idx) => {
            level.addEventListener("click", () => {
                if(level.querySelector(".edit-circle").classList.contains("edit-circle-active")){
                    level.querySelector(".edit-circle").classList.remove("edit-circle-active");

                    document.querySelectorAll(".edit-view-txt").forEach(col => {
                        if(col.textContent.replace(/ $/, "") == `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                            document.querySelector(".edit-view-col").removeChild(col);
                            checkAllSubjects();
                        }
                    });
                } else {
                    cont.querySelectorAll(".edit-level").forEach((el, elIdx) => {
                        if(elIdx != idx){
                            el.querySelector(".edit-circle").classList.remove("edit-circle-active");
                        }
                    });
                    if(`${level.querySelector(".edit-level-txt").textContent}` == "Ordinary"){
                        document.querySelectorAll(".edit-view-txt").forEach(col => {
                            if(col.textContent.replace(/ $/, "") == `Higher ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                                document.querySelector(".edit-view-col").removeChild(col);
                                checkAllSubjects();
                            }
                        });
                    } else {
                        document.querySelectorAll(".edit-view-txt").forEach(col => {
                            if(col.textContent.replace(/ $/, "") == `Ordinary ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                                document.querySelector(".edit-view-col").removeChild(col);
                                checkAllSubjects();
                            }
                        });
                    }

                    level.querySelector(".edit-circle").classList.add("edit-circle-active");
                    let newSubject = document.createElement("div");
                    newSubject.classList.add("edit-view-txt");
                    newSubject.innerHTML = `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent}<i class="fa-solid fa-xmark edit-view-xmark"></i>`;
                    dynamicLightMode(newSubject);
                    newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                        e.stopPropagation();
                        document.querySelector(".edit-view-col").removeChild(newSubject);
                        checkAllSubjects();
                    };
                    newSubject.id = `${cont.querySelector(".edit-selector-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "")}_${level.querySelector(".edit-level-txt").textContent}`;
                    let textFound = false;
                    document.querySelectorAll(".edit-view-txt").forEach(text => {
                        if(text.innerHTML == `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent}`){
                            textFound = true;
                        }
                    });
                    if(!textFound){
                        document.querySelector(".edit-view-col").appendChild(newSubject);
                        checkAllSubjects();
                    }
                }
                document.querySelector(".edit-view-head").textContent = "Your subjects (" + document.querySelectorAll(".edit-view-txt").length + ")";
            });
        });
    }});

    let lcSubjects = [
        "lev_Accounting",
        "lev_Agricultural Science",
        "lev_Applied Maths",
        "lev_Art",
        "lev_Biology",
        "lev_Business",
        "lev_Chemistry",
        "lev_Classical Studies",
        "lev_Computer Science",
        "lev_Construction Studies",
        "lev_Design & Communication Graphics",
        "lev_Economics",
        "lev_Engineering",
        "lev_English",
        "lev_French",
        "lev_Geography",
        "lev_German",
        "lev_History",
        "lev_Home Economics",
        "lev_Irish",
        "lev_Italian",
        "aut_Japanese",
        "aut_LCVP (Link Modules)",
        "lev_Mathematics",
        "lev_Music",
        "lev_Physical Education",
        "lev_Physics",
        "aut_Phys-Chem",
        "lev_Politics and Society",
        "lev_Religious Education",
        "lev_Spanish",
        "lev_Technology"
    ]
    let jcSubjects = [
        "aut_Applied Technology",
        "aut_Business Studies",
        "aut_Classics",
        "aut_CSPE",
        "aut_Engineering",
        "lev_English",
        "aut_French",
        "aut_Geography",
        "aut_German",
        "aut_Graphics",
        "aut_History",
        "aut_Home Economics",
        "lev_Irish",
        "aut_Italian",
        "lev_Mathematics",
        "aut_Music",
        "aut_Religious Education",
        "aut_Science",
        "aut_Spanish",
        "aut_SPHE",
        "aut_Wood Technology"
    ]
    document.querySelector(".edit-input").addEventListener("input", () => {
        let validSubjects = [];
        let searchSelector;

        let inpValue = document.querySelector(".edit-input").value;
        if(document.querySelector(".edit-pill-active").textContent == "Leaving Cert"){
            lcSubjects.forEach(subject => {
                if(subject.split("_")[1].toLowerCase().includes(inpValue.toLowerCase())){
                    validSubjects.push(subject);
                }
            });
        } else {
            jcSubjects.forEach(subject => {
                if(subject.split("_")[1].toLowerCase().includes(inpValue.toLowerCase())){
                    validSubjects.push(subject);
                }
            });
        }
        if(validSubjects.length > 0 && inpValue.length > 0){
            document.querySelectorAll(".edit-top-selector").forEach(selector => {
                if(!selector.classList.contains("edit-search-selector")){
                    selector.style.display = "none";
                } else {
                    selector.style.display = "block";
                    searchSelector = selector;
                }
            });
            let certText = document.querySelector(".edit-pill-active").textContent;
            searchSelector.innerHTML = `
                <div class="edit-selector-txt">${certText} <i class="fa-solid fa-chevron-down edit-chevron" style="transform: rotate(-180deg)"></i></div>
                <div class="edit-ul" style="display: block; opacity: 1;"></div>
            `
            validSubjects.forEach(valid => {   
                let subjectText = valid.split("_")[1];
                let newSelector = document.createElement("div");
                if(valid.includes("lev_")){
                    newSelector.classList.add("edit-selector");
                    newSelector.style.opacity = "1";
                    newSelector.innerHTML = `
                        <div class="edit-selector-txt">${subjectText}<i class="fa-solid fa-chevron-down edit-chevron" style="transform: rotate(-180deg);"></i></div>
                            <div class="edit-ul" style="display: block; opacity: 1;">
                                <div class="edit-level" style="opacity: 1;">
                                    <div class="edit-circle"><i class="fa-solid fa-check edit-circle-check"></i></div>
                                    <div class="edit-level-txt">Higher</div>
                                </div>
                                <div class="edit-level" style="opacity: 1;">
                                    <div class="edit-circle"><i class="fa-solid fa-check edit-circle-check"></i></div>
                                    <div class="edit-level-txt">Ordinary</div>
                                </div>
                            </div>
                    `
                    searchSelector.querySelector(".edit-ul").appendChild(newSelector);                    
                } else {
                    newSelector.classList.add("edit-auto");
                    newSelector.style.opacity = "1";
                    newSelector.innerHTML = `
                        <div class="edit-circle" style="border-radius: 4px;">
                            <i class="fa-solid fa-check edit-circle-check"></i>
                        </div> 
                        <div class="edit-auto-txt">${subjectText}</div>
                    `
                    searchSelector.querySelector(".edit-ul").appendChild(newSelector);  
                }
                dynamicLightMode(newSelector);
            });
            checkAllSubjects();
        } else {
            document.querySelector(".edit-search-selector").style.display = "none";
            document.querySelector(".edit-search-selector").innerHTML = `
                <div class="edit-selector-txt">Leaving Cert <i class="fa-solid fa-chevron-down edit-chevron"></i></div>
                <div class="edit-ul"></div>
            `
            if(inpValue.length == 0){
                document.querySelectorAll(".edit-top-selector").forEach((selector, idx) => {
                    if(!selector.classList.contains("edit-search-selector")){
                        
                        selector.style.display = "block";
                        selector.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(0deg)";
                        selector.querySelector(".edit-ul").style.display = "none";
                        selector.querySelector(".edit-ul").querySelectorAll(".edit-selector").forEach(inside => {
                            inside.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(0deg)";
                            if(inside.querySelector(".edit-ul")){
                                inside.querySelector(".edit-ul").style.display = "none";
                                inside.querySelectorAll(".edit-level").forEach(level => {
                                    level.style.opacity = "0";
                                });
                            }
                        });
                    } else {
                        selector.style.display = "none";
                    }
                });
            }
        }
        document.querySelector(".edit-search-selector").querySelectorAll(".edit-selector").forEach(cont => {
            cont.querySelector(".edit-selector-txt").addEventListener("click", () => {
                if(cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform == "rotate(-180deg)"){
                    cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(0deg)";
                    cont.querySelector(".edit-ul").style.display = "none";
                    cont.querySelector(".edit-ul").querySelectorAll(".edit-selector, .edit-level").forEach(selector => {
                        selector.style.opacity = "0";
                    });
                } else {
                    cont.querySelector(".edit-selector-txt").querySelector(".edit-chevron").style.transform = "rotate(-180deg)";
                    cont.querySelector(".edit-ul").style.display = "block";
                    setTimeout(() => {
                        if(cont.classList.contains("edit-top-selector")){
                            cont.querySelector(".edit-ul").querySelectorAll(".edit-selector").forEach(selector => {
                                selector.style.opacity = "1";
                            });   
                        } else {
                            cont.querySelector(".edit-ul").querySelectorAll(".edit-selector, .edit-level").forEach(selector => {
                                selector.style.opacity = "1";
                            });
                        }
                    }, 10);
                }
            });
        });
        document.querySelector(".edit-search-selector").querySelectorAll(".edit-auto").forEach(cont => {
            cont.addEventListener("click", () => {
                if(cont.querySelector(".edit-circle").classList.contains("edit-circle-active")){
                    cont.querySelector(".edit-circle").classList.remove("edit-circle-active");

                    document.querySelectorAll(".edit-view-txt").forEach(col => {
                        if(col.textContent == cont.querySelector(".edit-auto-txt").textContent){
                            document.querySelector(".edit-view-col").removeChild(col);
                            checkAllSubjects();
                        }
                    });
                } else {
                    cont.querySelector(".edit-circle").classList.add("edit-circle-active");

                    let newSubject = document.createElement("div");
                    newSubject.classList.add("edit-view-txt");
                    newSubject.innerHTML = `${cont.querySelector(".edit-auto-txt").textContent}<i class="fa-solid fa-xmark edit-view-xmark"></i>`;
                    dynamicLightMode(newSubject);
                    newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                        e.stopPropagation();
                        document.querySelector(".edit-view-col").removeChild(newSubject);
                        checkAllSubjects();
                    };
                    newSubject.id = `${cont.querySelector(".edit-auto-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "")}_Common`;
                    let textFound = false;
                    document.querySelectorAll(".edit-view-txt").forEach(text => {
                        if(text.innerHTML == `${cont.querySelector(".edit-auto-txt").textContent}`){
                            textFound = true;
                        }
                    });
                    if(!textFound){
                        document.querySelector(".edit-view-col").appendChild(newSubject);
                        checkAllSubjects();
                    }
                }
                document.querySelector(".edit-view-head").textContent = "Your subjects (" + document.querySelectorAll(".edit-view-txt").length + ")";
            });
        });
        document.querySelector(".edit-search-selector").querySelectorAll(".edit-selector").forEach(cont => {if(!cont.classList.contains("edit-top-selector")){
            cont.querySelectorAll(".edit-level").forEach((level, idx) => {
                level.addEventListener("click", () => {
                    if(level.querySelector(".edit-circle").classList.contains("edit-circle-active")){
                        level.querySelector(".edit-circle").classList.remove("edit-circle-active");

                        document.querySelectorAll(".edit-view-txt").forEach(col => {
                            if(col.textContent.replace(/ $/, "") == `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                                document.querySelector(".edit-view-col").removeChild(col);
                                checkAllSubjects();
                            }
                        });
                    } else {
                        cont.querySelectorAll(".edit-level").forEach((el, elIdx) => {
                            if(elIdx != idx){
                                el.querySelector(".edit-circle").classList.remove("edit-circle-active");
                            }
                        });
                        if(`${level.querySelector(".edit-level-txt").textContent}` == "Ordinary"){
                            document.querySelectorAll(".edit-view-txt").forEach(col => {
                                if(col.textContent.replace(/ $/, "") == `Higher ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                                    document.querySelector(".edit-view-col").removeChild(col);
                                    checkAllSubjects();
                                }
                            });
                        } else {
                            document.querySelectorAll(".edit-view-txt").forEach(col => {
                                if(col.textContent.replace(/ $/, "") == `Ordinary ${cont.querySelector(".edit-selector-txt").textContent.replace(/ $/, "")}`){
                                    document.querySelector(".edit-view-col").removeChild(col);
                                    checkAllSubjects();
                                }
                            });
                        }

                        level.querySelector(".edit-circle").classList.add("edit-circle-active");
                        let newSubject = document.createElement("div");
                        newSubject.classList.add("edit-view-txt");
                        newSubject.innerHTML = `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent}<i class="fa-solid fa-xmark edit-view-xmark"></i>`;
                        dynamicLightMode(newSubject);
                        newSubject.querySelector("i.edit-view-xmark").onclick = (e) => {
                            e.stopPropagation();
                            document.querySelector(".edit-view-col").removeChild(newSubject);
                            checkAllSubjects();
                        };
                        newSubject.id = `${cont.querySelector(".edit-selector-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "")}_${level.querySelector(".edit-level-txt").textContent}`;
                        let textFound = false;
                        document.querySelectorAll(".edit-view-txt").forEach(text => {
                            if(text.innerHTML == `${level.querySelector(".edit-level-txt").textContent} ${cont.querySelector(".edit-selector-txt").textContent}`){
                                textFound = true;
                            }
                        });
                        if(!textFound){
                            document.querySelector(".edit-view-col").appendChild(newSubject);
                            checkAllSubjects();
                        }
                    }
                    document.querySelector(".edit-view-head").textContent = "Your subjects (" + document.querySelectorAll(".edit-view-txt").length + ")";
                });
            });
        }});
        document.querySelector(".edit-search-selector").querySelectorAll(".edit-circle").forEach(circle => {
            circle.addEventListener("click", () => {
                setTimeout(checkEditComplete, 10);
            });
        });
    });
    function saveEdits(){
        async function requestEdit() {
            let cert = "lc";
            if(document.querySelector(".edit-pill-active").textContent.includes("Junior Cert")){
                cert = "jc";
            }
            let pickedSubjects = [];
            document.querySelectorAll(".edit-view-txt").forEach(txt => {
                let level;
                let newStr = txt.id.toLowerCase().replace(/ /g, "-").replace(/-_/g, "_").replace(/[(&)]/g, "").replace("--", "-");
                let subject = newStr.split("_")[0];
                if(newStr.split("_")[1] == "higher"){
                    level = "hl";
                } else if(newStr.split("_")[1] == "ordinary"){
                    level = "ol";
                } else if(newStr.split("_")[1] == "common"){
                    level = "cl";
                }
                let finalStr = `${cert}_${level}_${subject}`;
                pickedSubjects.push(finalStr);
            });
            if(pickedSubjects.length == 0){
                document.getElementById("saveError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("saveError").style.display = "none";
                }, 2000);
            } else {
                const dataToSend = { subjects: pickedSubjects };
                try {
                    const response = await fetch(url + '/api/edit-subjects', {
                        method: 'POST',
                        
                        headers: {
                            'Content-Type': 'application/json', 
                        },
                        body: JSON.stringify(dataToSend), 
                    });
    
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error:', errorData.message);
                        return;
                    }
    
                    const data = await response.json();
                    if(data.message == "success"){
                        window.location.href = "/settings?section=subjects";
                    }
                } catch (error) {
                    console.error('Error posting data:', error);
                }
            }
        }
        requestEdit();
    }
}

if(document.querySelector(".sign-container")){
    const params = new URLSearchParams(window.location.search);
    if(params.get("onboarding") == "false"){
        showContainer(document.querySelector(".sign-container"));
    } else if(params.get("section") == "profile"){
        showContainer(document.querySelector(".profile-container"));
    } else if(params.get("section") == "subject"){
        showContainer(document.querySelector(".edit-container"));
    } else if(params.get("section") == "use"){
        showContainer(document.querySelector(".use-container"));
    }

    if(document.getElementById("profileForm")){
        document.getElementById("profileForm").addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const res = await fetch(url + "/api/profile", {
                method: "POST",
                
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const responseData = await res.json();
            if(responseData.message == "username taken"){
                document.getElementById("userError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("userError").style.display = "none";
                }, 2000);
            } else if(responseData.message == "success") {
                window.location.href = "/sign-up?onboarding=true&section=subject";
            }
        });
    }

    async function postSubjects() {
        if(!document.querySelector(".edit-view-txt")){
            window.alert("Please pick a subject");
        } else {
            let cert = "lc";
            if(document.querySelector(".edit-pill-active").textContent.includes("Junior Cert")){
                cert = "jc";
            }
            let pickedSubjects = [];
            document.querySelectorAll(".edit-view-txt").forEach(txt => {
                let level;
                let newStr = txt.id.toLowerCase().replace(/ /g, "-").replace(/-_/g, "_").replace(/[(&)]/g, "").replace("--", "-");
                let subject = newStr.split("_")[0];
                if(newStr.split("_")[1] == "higher"){
                    level = "hl";
                } else if(newStr.split("_")[1] == "ordinary"){
                    level = "ol";
                } else if(newStr.split("_")[1] == "common"){
                    level = "cl";
                }
                let finalStr = `${cert}_${level}_${subject}`;
                pickedSubjects.push(finalStr);
            });

            const dataToSend = { subjects: pickedSubjects };
            try {
                const response = await fetch(url + '/api/post-subjects', {
                    method: 'POST',
                    
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                    body: JSON.stringify(dataToSend), 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    return;
                }

                const responseData = await response.json();
                if(responseData.message == "success"){
                    window.location.href = "/sign-up?onboarding=true&section=use";
                }
            } catch (error) {
                console.error('Error posting data:', error);
            }
        }
    }

    function continueSubjects(){
        postSubjects();
    }

    async function updateStatus() {
        try {
            const response = await fetch(url + '/api/status2');
            const data = await response.json(); 
            if(data.message == "success") window.location.href = "/";
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function continueUse(){
        updateStatus();
    }

    function showContainer(container){
        container.style.display = "flex";
        container.style.transform = "scale(1)";
        container.style.opacity = "1";
    }

    clickOption(".profile-pill", "profile-pill-active");
    document.querySelector(".profile-container").querySelectorAll(".log-input").forEach(input => {
        input.addEventListener("input", checkProfileComplete);
    });
    document.querySelector(".profile-container").querySelectorAll(".profile-pill").forEach(pill => {
        pill.addEventListener("click", checkProfileComplete);
    });
    function checkProfileComplete(){
        let isComplete = true;
        document.querySelector(".profile-container").querySelectorAll(".log-input").forEach(input => {
            if(input.value.length == 0){
                isComplete = false;
            }
        });
        if(!document.querySelector(".profile-container").querySelector(".profile-pill-active")){
            isComplete = false;
        }
        if(isComplete){
            document.querySelector(".profile-container").querySelector(".btn-onboard").classList.remove("btn-inactive");
        } else {
        }
    }
    document.querySelectorAll(".edit-circle").forEach(circle => {
        circle.addEventListener("click", () => {
            setTimeout(checkEditComplete, 10);
        });
    }); 
    
    if(document.getElementById("signForm")){
        document.getElementById("signForm").addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const res = await fetch(url + "/api/signup", {
                method: "POST",
                
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const responseData = await res.json();
            if(responseData.message == "email taken"){
                document.getElementById("emailError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("emailError").style.display = "none";
                }, 2000);
            } else if(responseData.message == "invalid email"){
                document.getElementById("invalidError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("invalidError").style.display = "none";
                }, 2000);
            } else if(responseData.message == "failure"){
                document.getElementById("serverError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("serverError").style.display = "none";
                }, 2000);
            } else if(responseData.message == "success") {
                window.location.href = "/verify";
            }
        });
    }
}
function checkEditComplete(){
    if(document.querySelector(".edit-view-txt") && document.querySelector(".edit-container")){
        document.querySelector(".edit-container").querySelector(".btn-onboard").classList.remove("btn-inactive");
    } else if(document.querySelector(".edit-container")) {
    }
}

if(document.getElementById("logForm")){
    document.getElementById("logForm").addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch(url + "/api/login", {
            method: "POST",
            
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const responseData = await res.json(); // assuming backend sends JSON
        if(responseData.message == "failure"){
            document.getElementById("serverError").style.display = "block";
            setTimeout(() => {
                document.getElementById("serverError").style.display = "none";
            }, 2000);
        } else if(responseData.message == "no user"){
            document.getElementById("emailError").style.display = "block";
            setTimeout(() => {
                document.getElementById("emailError").style.display = "none";
            }, 2000);
        } else if(responseData.message == "invalid password"){
            document.getElementById("passwordError").style.display = "block";
            setTimeout(() => {
                document.getElementById("passwordError").style.display = "none";
            }, 2000);
        } else if(responseData.message == "success"){
            window.location.href = "/";
        }
    });
}

if(document.querySelector(".ver-container") || document.querySelector(".set-container")){
    document.querySelectorAll(".ver-inp-container")[0].classList.add("ver-inp-active");
    document.querySelectorAll(".ver-inp-container")[0].querySelector(".ver-inp").focus();

    document.querySelectorAll(".ver-inp").forEach((inp, idx) => {
        inp.addEventListener("input", () => {if(inp.value.length > 0){
            if(idx < 5){
                document.querySelectorAll(".ver-inp")[idx + 1].focus();
            } else if(idx == 5) {
                document.querySelectorAll(".ver-inp")[idx].blur();
            }
        }});

        inp.addEventListener("keydown", (e) => {
            if(e.key == "Backspace" && inp.value == "" && idx > 0){
                setTimeout(() => {
                    document.querySelectorAll(".ver-inp")[idx - 1].focus();
                }, 5);
            }
        });

        inp.addEventListener("focus", () => {
            document.querySelectorAll(".ver-inp-container")[idx].classList.add("ver-inp-active");
        });
        inp.addEventListener("blur", () => {
            document.querySelectorAll(".ver-inp-container")[idx].classList.remove("ver-inp-active");
        });
    });

    async function sendCode(code){
        const dataToSend = { code: code };
        try {
            const response = await fetch(url + '/api/verify', {
                method: 'POST',
                
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(dataToSend), 
            });

            if(!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                return;
            }

            const responseData = await response.json();
            if(responseData.message == "success"){
                window.location.href = "/sign-up?onboarding=true&section=profile";
            } else {
                document.getElementById("verError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("verError").style.display = "none";
                }, 2000);
            }
        } catch (error) {
            console.error('Error posting data:', error);
        }
    }

    async function verifySettings(code) {
        const dataToSend = { code: code };
        try {
            const response = await fetch(url + '/api/settings-verify', {
                method: 'POST',
                
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(dataToSend), 
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                return;
            }

            const data = await response.json();
            if(data.message == "success"){
                document.querySelector(".set-ver-modal").style.opacity = "0";
                document.querySelector(".set-ver-modal").style.pointerEvents = "none";
                document.getElementById("thankStr").textContent = settingsData[settingsIdx].ui;
                document.querySelector(".set-thank-modal").style.opacity = "1";
                document.querySelector(".set-thank-modal").style.pointerEvents = "auto";
            } else if(data.message == "incorrect"){
                document.getElementById("verError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("verError").style.display = "none";
                }, 2000);
            }
        } catch (error) {
            console.error('Error posting data:', error);
        }
    }

    document.querySelectorAll(".btn-ver, span.ver-txt").forEach(resender => {
        resender.addEventListener("click", () => {
            let enteredCode = "";
            document.querySelectorAll(".ver-inp").forEach(inp => {
                enteredCode += inp.value;
            });
            if(enteredCode.length == 6){
                if(document.querySelector(".ver-container")){
                    sendCode(enteredCode);
                } else if(document.querySelector(".set-container")){
                    verifySettings(enteredCode);
                }
            } else {
                document.getElementById("verError").style.display = "block";
                setTimeout(() => {
                    document.getElementById("verError").style.display = "none";
                }, 2000);
            }
        });
    });
}

if(document.querySelector(".home-nav")){
    clickOption(".nav-link", "nav-link-active");
}

if(document.querySelector(".msg-container")){
    if(!localStorage.getItem("msgyet")){
        localStorage.setItem("msgyet", true);
        setTimeout(() => {
            document.querySelector(".msg-container").style.opacity = "1";
            document.querySelector(".msg-container").style.pointerEvents = "auto";
        }, 1500);
    }

    document.querySelector(".msg-container").addEventListener("click", (e) => {
        if(!document.querySelector(".msg-wrapper").contains(e.target)){
            document.querySelector(".msg-container").style.opacity = "0";
            document.querySelector(".msg-container").style.pointerEvents = "none";
        }
    });
    document.querySelector(".btn-msg-cancel").addEventListener("click", () => {
        document.querySelector(".msg-container").style.opacity = "0";
        document.querySelector(".msg-container").style.pointerEvents = "none";
    });

    document.querySelector(".msg-wrapper").addEventListener("submit", function(e) {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
        }).then(response => {
        if (response.ok) {
            document.querySelector(".msg-container").style.opacity = "0";
            document.querySelector(".msg-container").style.pointerEvents = "none";
            document.querySelector(".set-thank-modal").style.opacity = "1";
            document.querySelector(".set-thank-modal").style.pointerEvents = "auto";
            form.reset();
        } else {
            console.error("NOT OKAY");
        }
        });
    });
}


function makeTitle(){
    const pathParts = window.location.pathname.split('/');
    const subject = pathParts[3];
    const level = pathParts[4];

    let homeTitle = subject.charAt(0).toUpperCase() + subject.slice(1) + " (" + level.toUpperCase() + ")";
    if(level == "cl") {
        homeTitle = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    document.querySelector(".home-title").textContent = homeTitle.replace(/-/g, " ");
}
function clickOption(className, newClass){
    document.querySelectorAll(className).forEach((element, idx) => {
        element.addEventListener("click", () => {
            document.querySelectorAll(className).forEach(el => {
                el.classList.remove(newClass);
            });
            element.classList.add(newClass);
        });
    });
}
function colourScores(){
    document.querySelectorAll(".res-score, .topc-res-score").forEach(score => {
        let scoreMult = score.textContent.slice(0, score.textContent.indexOf("%"));
        if(Number(scoreMult < 10)){
            scoreMult = "0.0" + scoreMult;
        } else if(Number(scoreMult > 9) && Number(scoreMult < 100)){
            scoreMult = "0." + scoreMult;
        } else {
            scoreMult = "1";
        }
        let hueNumber = 140 * Number(scoreMult);
        score.style.backgroundColor = "hsl(" + String(hueNumber) + ", 65%, 35%)";
    });
}
function dropSide(section){
    if(section == "library"){
        sideDrop[0].style.opacity = "1";
        sideDrop[0].style.pointerEvents = "auto";
    }
}
function printImages(arrayOfImages){
    const iframe = document.getElementById('printFrame');
    const doc = iframe.contentWindow.document;

    let imagesHTML = '';
    arrayOfImages.forEach(img => {
        imagesHTML += `<img src="${img.src}" style="display: block; margin: 20px auto;" />`;
    });

    doc.open();
    doc.write(`
        <html>
        <head>
            <style>
            body { margin: 0; text-align: center; }
            img { max-width: 100%; height: auto; page-break-after: always; }
            </style>
        </head>
        <body>
            ${imagesHTML}
            <script>
            window.onload = function () {
                window.focus();
                window.print();
            };
            <\/script>
        </body>
        </html>
    `);
    doc.close();
}
function printSheet(){
  const wrappers = document.querySelectorAll('.she-container .she-wrapper');
  const content = Array.from(wrappers).map(w => w.outerHTML).join('');

  let overflow = "overflow: hidden;";
  if (wrappers.length > 1) {
    overflow = "";
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  let sheWrapperHeight = "100%";
  if(isMobile){
    sheWrapperHeight = "auto";
  }

  // The HTML we want to print
  const htmlContent = `
    <html>
      <head>
        <title>Print Worksheet</title>
        <style>
          @media print {
            @page { 
              size: A4 portrait;
              margin: 1mm; 
            } 
            body, html {
              width: 210mm;
              height: 297mm;
              ${overflow}
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }
            .she-wrapper {
              position: relative;
              width: 100%;
              min-height: 280mm;
              height: ${sheWrapperHeight};
              page-break-after: always;
              box-sizing: border-box;
              padding: 3mm;
            }
            .she-wrapper:last-child {
              page-break-after: auto;
            }
            .she-wrapper-inside {
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
              overflow: hidden;
            }
          }
          .she-top {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .she-title {
            font-size: 22px;
            font-weight: 500;
          }
          .she-logo {
            opacity: 1;
            margin: 4px 5px;
            height: 22px;
            width: auto;
          }
          .she-img-container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
          }
          .she-img {
            width: 100%;
            max-height: 100%;
            height: auto;
            object-fit: contain;
          }
          .she-name {
            padding-right: 40mm;
          }
          .she-idx {
            position: absolute;
            bottom: 15px;
            right: 15px;
          }
          .she-lines-img {
            width: 100%;
            height: auto;
            margin: 20mm 0 10mm;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;


    if (isMobile) {
    // Use new window method for mobile
    const newWin = window.open("", "_blank");
    newWin.document.write(htmlContent);
    newWin.document.close();

    newWin.onload = () => {
        newWin.focus();
        newWin.print();

        // Close automatically after print
        newWin.onafterprint = () => {
        newWin.close();
        };
    };
    } else {
    // Desktop: use hidden iframe
    const oldIframe = document.getElementById('print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      iframe.remove();
    };
  }
}
function dropProfile(){
    document.querySelector(".pfp-drop").style.opacity = "1";
    document.querySelector(".pfp-drop").style.pointerEvents = "auto";
}
function showTopics(){
    if(document.querySelector(".btn-topc-more").querySelector(".topc-show-icon").style.transform != "rotate(-180deg)"){
        document.querySelector(".topc-col-scroll").style.maxHeight = "1900px";
        document.querySelector(".btn-topc-more").querySelector("span").textContent = "Show Less";
        document.querySelector(".btn-topc-more").querySelector(".topc-show-icon").style.transform = "rotate(-180deg)";
    } else {
        document.querySelector(".topc-col-scroll").style.maxHeight = "342px";
        document.querySelector(".btn-topc-more").querySelector("span").textContent = "Show More";
        document.querySelector(".btn-topc-more").querySelector(".topc-show-icon").style.transform = "rotate(0deg)";
    }
}
function toggleMenu(){
    if(document.querySelector(".header-burger").querySelector(".line1")){
        document.querySelector(".page-shadow").style.opacity = "1";
        document.querySelector(".page-shadow").style.pointerEvents = "auto";
        document.querySelector(".side-nav").style.right = "0";
        document.querySelector(".header").style.boxShadow = "0";
        document.querySelector(".header-burger").querySelectorAll(".burger-line").forEach((line, idx) => {
            line.classList.remove(`line${idx + 1}`);
            line.classList.add(`cross${idx + 1}`);
        });
    } else {
        document.querySelector(".page-shadow").style.opacity = "0";
        document.querySelector(".page-shadow").style.pointerEvents = "none";
        document.querySelector(".side-nav").style.right = "-250px";
        document.querySelector(".header-burger").querySelectorAll(".burger-line").forEach((line, idx) => {
            line.classList.add(`line${idx + 1}`);
            line.classList.remove(`cross${idx + 1}`);
        });
    }
}
function closeSideNav(){
    document.querySelector(".page-shadow").style.opacity = "0";
    document.querySelector(".page-shadow").style.pointerEvents = "none";
    document.querySelector(".side-nav").style.right = "-250px";
    document.querySelector(".header-burger").querySelectorAll(".burger-line").forEach((line, idx) => {
        line.classList.add(`line${idx + 1}`);
        line.classList.remove(`cross${idx + 1}`);
    });
}
function logoutClick(){
    async function logout(){
        try {
            const response = await fetch(url + '/api/logout');
            const data = await response.json(); 
            if(data.message == "success"){
                window.location.href = "/login";
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    logout();
}
function checkAllSubjects(){
    resetCircles();
    let currentSubjects = [];
    document.querySelectorAll(".edit-view-txt").forEach(text => {
        currentSubjects.push(text.id);
    });
    console.log(currentSubjects);
    document.querySelectorAll(".edit-auto").forEach(sect => {
        currentSubjects.forEach(subject => {
            if(sect.querySelector(".edit-auto-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "") + "_Common" == subject){
                sect.querySelector(".edit-circle").classList.add("edit-circle-active");
            } 
        });
    });
    document.querySelectorAll(".edit-selector").forEach(sect => {
        currentSubjects.forEach(subject => {
            if(sect.querySelector(".edit-selector-txt").textContent.replace(/ /g, "-").replace("-_", "_").replace(/-$/, "") == subject.split("_")[0]){
                if(subject.split("_")[1] == "Higher"){
                    sect.querySelectorAll(".edit-circle")[0].classList.add("edit-circle-active");
                } else {
                    sect.querySelectorAll(".edit-circle")[1].classList.add("edit-circle-active");
                }
            } 
        });
    });
    document.querySelector(".edit-view-head").textContent = "Your subjects (" + document.querySelectorAll(".edit-view-txt").length + ")";
}
function resetCircles(){
    document.querySelectorAll(".edit-circle").forEach(circle => {
        circle.classList.remove("edit-circle-active");
    });
}
function scrollToTop(element){
    element.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
function sortImgLayers(arrayObjs){
    let newObj = [];
    for(let i = 1; i <= arrayObjs.length; i++){
        arrayObjs.forEach(obj => {
            if(obj.layer == String(i)){
                newObj.push(obj);
            }
        });
    }
    return newObj;
}
function getCurrentDate() {
  const today = new Date();

  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}
function previousPage(){
    if(document.referrer){
        window.history.back();
    } else {
        window.location.href = "/"; // fallback to home
    }
}
function levenshtein(a, b){
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
  return array;
}
function SubjectShort(long){
    let subjectSlug = long;
    if(long == "Lcvp Link Modules"){
        subjectSlug = "LCVP";
    } else if(long == "Design Communication Graphics"){
        subjectSlug = "Graphics";
    } else if(long == "Agricultural Science"){
        subjectSlug = "Ag Science";
    } else if(long == "Computer Science"){
        subjectSlug = "Comp Scie";
    } else if(long == "Construction Studies"){
        subjectSlug = "Construction"
    } else if(long == "Home Economics"){
        subjectSlug = "Home Ec";
    } else if(long == "Physical Education"){
        subjectSlug = "PE";
    } else if(long == "Religious Education"){
        subjectSlug = "Religion";
    } else if(long == "Politics And Society"){
        subjectSlug = "Pol Soc";
    } else if(long == "Applied Technology"){
        subjectSlug = "Technology";
    } else if(long == "Business Studies"){
        subjectSlug = "Business";
    }
    return subjectSlug;
}
function toggleMode() {
    if(currentMode == "light"){
        document.querySelector("i.side-moon").style.display = "none";
        document.querySelector("i.side-sun").style.display = "block";
        document.querySelector(".mode-section").querySelector(".side-txt").textContent = "Light Mode";
        localStorage.setItem("theme", "dark");
        currentMode = "dark";
        
        document.querySelectorAll("*").forEach(el => {
            el.classList.add("dark-mode-element");
        });
        addStyle(".pap-selector", "border", "1px solid hsl(145, 15%, 22%)");
    } else {
        document.querySelector("i.side-sun").style.display = "none";
        document.querySelector("i.side-moon").style.display = "block";
        document.querySelector(".mode-section").querySelector(".side-txt").textContent = "Dark Mode";
        localStorage.setItem("theme", "light");
        currentMode = "light";
        
        document.querySelectorAll("*").forEach(el => {
            el.classList.remove("dark-mode-element");
        });
        addStyle(".pap-selector", "border", "1px solid hsl(0, 0%, 60%)");
    }
}
function addStyle(elementClass, styleType, styleValue){
    const element = document.querySelector(elementClass);
    if(element){
        document.querySelectorAll(elementClass).forEach(el => {
            el.style[styleType] = styleValue;
        });
    }
}
function addHover(elementClass, styleType, styleValue, originalValue){
    const element = document.querySelector(elementClass);
    if(element){
        document.querySelectorAll(elementClass).forEach(el => {
            el.onmouseenter = () => {
                el.style[styleType] = styleValue;
            }
            el.onmouseleave = () => {
                el.style[styleType] = originalValue;
            }
        });
    }
}
const lazyObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const question = entry.target;
      question.querySelectorAll(".exam-question-img, .exam-scheme-img, .exam-scheme-img, .bld-ques-img").forEach(img => {
        img.src = img.dataset.src;
      });
      if(question.querySelector("audio")) question.querySelector("audio").src = question.querySelector("audio").dataset.src;
      observer.unobserve(question);
    }
  });
}, {
  threshold: 0.01
});
function dynamicLightMode(element){
    if(currentMode == "light"){
        element.classList.remove("dark-mode-element");
        element.querySelectorAll("*").forEach(child => {
            child.classList.remove("dark-mode-element");
        });
    } else {
        element.classList.add("dark-mode-element");
        element.querySelectorAll("*").forEach(child => {
            child.classList.add("dark-mode-element");
        });
    }
}



document.addEventListener("mousedown", (e) => {
    if(document.querySelector(".exam-question")){
        document.querySelectorAll(".exam-manage").forEach(el => {
            if(!el.contains(e.target)){
                el.querySelector(".manage-chevron").style.transform = "rotate(0deg)";
                el.querySelector(".manage-drop").style.opacity = "0";
                el.querySelector(".manage-drop").style.pointerEvents = "none";
            }
        });
    }

    if(popSubjectBox && !popSubjectBox.contains(e.target) && isPopDropped){
        popChevron.style.transform = "rotate(-90deg)";
        popDrop.style.opacity = "0";
        popDrop.style.pointerEvents = "none";
        isPopDropped = false;
    }

    if(comSort && !comSort.contains(e.target) && isSortDropped){
        comDrop.style.opacity = "0";
        comDrop.style.pointerEvents = "none";
        comChevron.style.transform = "rotate(0deg)";
        isSortDropped = false;
    }

    if(papSelector && !papSelector.contains(e.target) && isPapDropped){
        if(currentMode == "light") papSelector.style.border = "1px solid hsl(0, 0%, 60%)";
        papArrow.style.transform = "rotate(0deg)";
        papDropdown.classList.remove("pap-drop-open");
        papDropdown.classList.add("pap-drop-closed");
        isPapDropped = false;
    }

    sideSec.forEach((sec, idx) => {
        let insideDrop = sec.querySelector(".side-drop");
        if(insideDrop && !sec.contains(e.target) && insideDrop.style.opacity == "1"){
            insideDrop.style.opacity = "0";
            insideDrop.style.pointerEvents = "none";
        }
    });

    if(document.querySelector(".pfp-drop") && !document.querySelector(".pfp-container").contains(e.target) && !document.querySelector(".pfp-drop").contains(e.target) && document.querySelector(".pfp-drop").style.opacity == "1"){
        document.querySelector(".pfp-drop").style.opacity = "0";
        document.querySelector(".pfp-drop").style.pointerEvents = "none";
    }
    
    subDrop.forEach(cont => {
        if(cont && !cont.contains(e.target) && cont.style.opacity == "1"){
            cont.style.opacity = "0";
            cont.style.pointerEvents = "none";
        }
    });
    
    document.querySelectorAll(".set-drop").forEach((drop, idx) => {
        if(drop && !drop.contains(e.target) && !document.querySelectorAll(".btn-edit-sub")[idx].contains(e.target) && !document.querySelector(".set-change-modal").contains(e.target) && drop.style.opacity == "1"){
            drop.style.opacity = "0";
            drop.style.pointerEvents = "none";
        }
    });

    if(document.querySelector(".topc-container") && document.querySelector(".topc-result-container").style.opacity == "1" && !document.querySelector(".topc-inp-holder").contains(e.target)){
        document.querySelector(".topc-inp-container").style.marginBottom = "20px";
        document.querySelector(".topc-result-container").style.opacity = "0";
    }
});