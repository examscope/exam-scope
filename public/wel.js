

document.addEventListener("keydown", (e) => {
    if(e.key == "w"){
        console.log(window.innerWidth);
    }
});

function startAnimation(){
    document.querySelectorAll(".start").forEach((start, idx) => {
        setTimeout(() => {
            if(start.classList.contains("hero-phone-container")){
                start.style.transform = "translateX(-50%) translateY(0px)";
                start.style.top = "40px";
            } else {
                start.style.transform = "translateY(0px)";
            }
            start.style.opacity = "1";
        }, idx * 400);
    });
}
startAnimation();

document.querySelectorAll(".faq-cat-cat").forEach((cat, idx) => {
    cat.addEventListener("click", () => {
        document.querySelectorAll(".faq-cat-cat").forEach(other => {
            other.classList.remove("faq-cat-active");
        });
        cat.classList.add("faq-cat-active");
        document.querySelectorAll(".faq-wrapper").forEach(wrapper => {
            if(wrapper.classList.contains("faqw-" + idx)){
                wrapper.style.display = "block";
            } else {
                wrapper.style.display = "none";
            }
        });
    });
});

document.querySelectorAll(".faq-wrapper").forEach(wrapper => {
    wrapper.addEventListener("click", () => {
        let txtBox = wrapper.querySelector(".faq-txt-box");
        if(wrapper.querySelector(".faq-y").style.opacity == "0"){
            wrapper.classList.remove("faq-wrapper-active");
            txtBox.classList.remove("faq-txt-active");
            wrapper.querySelector(".faq-y").style.opacity = "1";
        } else {
            wrapper.classList.add("faq-wrapper-active");
            txtBox.classList.add("faq-txt-active");
            wrapper.querySelector(".faq-y").style.opacity = "0";
        }
    });
});

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
          entry.target.style.position = "relative";
          entry.target.style.top = "0px";
          entry.target.style.opacity = "1";

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
});
document.querySelectorAll(".scroll-target").forEach(target => {
    observer.observe(target);
});