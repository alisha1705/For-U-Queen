
// Global error catcher - shows error visibly on page
window.onerror = function (msg, src, line, col, err) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:12px;font-size:13px;z-index:9999;font-family:monospace;';
    d.textContent = 'JS ERROR: ' + msg + ' (line ' + line + ')';
    document.body.appendChild(d);
};
try {
    const CONFIG = {
        // Basic Info
        targetName: "My girl",      // Name/pronoun of the birthday recipient
        age: 16,                    // Age celebrated

        // Media Asset URLs (Can point to local paths or CDNs)
        musicUrl: "song.mp3",
        introGifUrl: "1.gif",
        cakeGifUrl: "2.gif",
        loaderImageUrl: "hello_kitty.png", // Birthday loader image

        // Photo Gallery Assets (4 Polaroids)
        // galleryPhotos: [
        //     { id: 1, src: "hello_kitty.png" },
        //     { id: 2, src: "1.gif" },
        //     { id: 3, src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop" },
        //     { id: 4, src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop" }
        // ],

        // Secret Love Letter Message (Supports multi-line text)
        letterText: `My favorite person 🐼

You know, having you in my life makes everything feel a little brighter and a lot more beautiful 🫶

I love the way you make me smile, the way you make ordinary moments feel special, and the way you somehow make my heart feel at home 😌

I want us to share unlimited laughs, love, silly fights, late-night talks, and countless beautiful memories together 🧿😚

Thank you for being my comfort, my happiness, and my favorite person in every sense ❤️

I love you forever and ever and ever ♾️😘😘❤️🧿`
    };

    /* ==========================================
       APPLICATION CORE STATE & CONTROLLER
       ========================================== */
    const STATE = {
        step: 0,              // Current step/stage
        isMuted: true,        // Starts muted (user holds button to play & unmute)
        holdProgress: 0,      // Stage 0 button hold percentage (0 to 100)
        holdInterval: null,   // Timer for holding
        audio: null,          // Audio element
        sliceProgress: 0      // Stage 2 slice percentage
    };

    // Prepopulate Dynamic Config Elements
    document.getElementById("loader-display-img").src = CONFIG.loaderImageUrl;
    document.getElementById("intro-gif-display").src = CONFIG.introGifUrl;
    document.getElementById("cake-gif-display").src = CONFIG.cakeGifUrl;
    document.getElementById("intro-title-text").textContent = `${CONFIG.targetName} was born ${CONFIG.age} years ago today!`;

    // Populate Gallery Slides
    //     const slidesWrapper = document.getElementById("gallery-slides-wrapper");
    //     CONFIG.galleryPhotos.forEach(photo => {
    //         const slideDiv = document.createElement("div");
    //         slideDiv.className = "swiper-slide";
    //         slideDiv.innerHTML = `
    //     <div class="polaroid-card">
    //       <div class="polaroid-img-frame">
    //         <img src="hello_kitty.png" alt="Memory asset " loading="lazy">
    //       </div>
    //       <div class="polaroid-caption">IMG_hello_kitty.PNG</div>
    //     </div>
    //   `;
    //         slidesWrapper.appendChild(slideDiv);
    //     });

    /* Initialize background audio */
    STATE.audio = new Audio(CONFIG.musicUrl);
    STATE.audio.loop = true;
    console.log("src:", STATE.audio.src);
console.log("readyState:", STATE.audio.readyState);
console.log("networkState:", STATE.audio.networkState);
console.log("error:", STATE.audio.error);

    /* Initialize Hearts Particle Spawning */
    const heartsContainer = document.getElementById("hearts-container");
    function spawnHeart() {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.innerHTML = Math.random() > 0.5 ? "♡" : "♥";

        const leftPos = Math.random() * 100;
        const fontSize = 16 + Math.random() * 20;
        const duration = 8 + Math.random() * 6;
        const delay = Math.random() * 2;

        heart.style.left = `${leftPos}%`;
        heart.style.fontSize = `${fontSize}px`;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;

        // Heart color hues
        const colors = ["#ff5ea6", "#ffccd5", "#ff8ab9", "#d4789c"];
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];

        heartsContainer.appendChild(heart);

        // Cleanup heart DOM after float animation ends
        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000);
    }

    // Periodically spawn floating background hearts
    setInterval(spawnHeart, 500);

    /* Stage Transition Handler */
    function showStage(stepNumber) {
        STATE.step = stepNumber;

        // Update Window Header Titles
        const headerTitle = document.getElementById("window-header-title");
        const titles = ["SEAL.EXE", "PARTY.EXE", "CAKE.EXE", "GALLERY.EXE", "LETTER.EXE"];
        headerTitle.textContent = titles[stepNumber] || "SURPRISE.EXE";

        // Hide all stage-views
        const stages = [
            document.getElementById("curtain-overlay"),
            document.getElementById("stage-countdown"),
            document.getElementById("stage-loader"),
            document.getElementById("stage-party"),
            document.getElementById("stage-cake"),
            document.getElementById("stage-gallery"),
            document.getElementById("stage-letter")
        ];

        stages.forEach(stage => {
            if (!stage) return;
            stage.classList.remove("active");
            if (stage.classList.contains("stage-view")) {
                stage.style.display = "none";
            }
        });

        // Target active stage element
        let activeEl;
        if (stepNumber === 0) {
            // Step 0 handles curtain, countdown, and loader within themselves
            activeEl = document.getElementById("curtain-overlay");
            activeEl.classList.remove("open");
            document.querySelector(".curtain-content").style.opacity = "1";
            document.querySelector(".curtain-content").style.pointerEvents = "all";
        } else if (stepNumber === 1) {
            activeEl = document.getElementById("stage-party");
        } else if (stepNumber === 2) {
            activeEl = document.getElementById("stage-cake");
        } else if (stepNumber === 3) {
            activeEl = document.getElementById("stage-gallery");
            initGallerySwiper();
        } else if (stepNumber === 4) {
            activeEl = document.getElementById("stage-letter");
        }

        // Ensure curtain overlay never blocks clicks on later stages
        const overlay = document.getElementById("curtain-overlay");
        if (overlay) {
            overlay.style.pointerEvents = stepNumber === 0 ? "auto" : "none";
        }

        if (activeEl) {
            if (activeEl.classList.contains("stage-view")) {
                activeEl.style.display = "flex";
            }
            // Force reflow for CSS scale animations
            void activeEl.offsetWidth;
            activeEl.classList.add("active");
            // Init cake game AFTER element is visible so canvas gets real dimensions
            if (stepNumber === 2) {
                requestAnimationFrame(() => requestAnimationFrame(() => initCakeSlicingGame()));
            }
        }
    }

    // Initialize display
    showStage(0);



    /* ==========================================
       STAGE 0: PRESS-AND-HOLD SEAL LOGIC
       ========================================== */
    const holdBtn = document.getElementById("hold-active-btn");
    const progressCircle = document.getElementById("hold-progress-bar");
    const maxCircumference = 263.89; // 2 * PI * 42

    function updateHoldProgressRing() {
        const offset = maxCircumference - (STATE.holdProgress / 100) * maxCircumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    function triggerHoldStart() {
        holdBtn.classList.add("pressing");
        clearInterval(STATE.holdInterval);

        STATE.holdInterval = setInterval(() => {
            if (STATE.holdProgress < 100) {
                STATE.holdProgress += 1.5;
                if (STATE.holdProgress >= 100) {
                    STATE.holdProgress = 100;
                    clearInterval(STATE.holdInterval);
                    triggerHoldDone();
                }
                updateHoldProgressRing();
            }
        }, 30);
    }

    function triggerHoldRelease() {
        holdBtn.classList.remove("pressing");
        clearInterval(STATE.holdInterval);

        // Animate progress resetting to 0
        STATE.holdInterval = setInterval(() => {
            if (STATE.holdProgress > 0) {
                STATE.holdProgress -= 3;
                if (STATE.holdProgress <= 0) {
                    STATE.holdProgress = 0;
                    clearInterval(STATE.holdInterval);
                }
                updateHoldProgressRing();
            }
        }, 20);
    }

    // function triggerHoldDone() {
    //     // 1. Play Background Music with fade-in volume
    //     STATE.audio.volume = 0;
    //     STATE.audio.play().then(() => {
    //         let vol = 0;
    //         let fadeTimer = setInterval(() => {
    //             if (vol < 0.9) {
    //                 vol += 0.1;
    //                 STATE.audio.volume = vol;
    //             } else {
    //                 STATE.audio.volume = 1.0;
    //                 clearInterval(fadeTimer);
    //             }
    //         }, 100);
    //     }).catch(() => { });
    function triggerHoldDone() {
    // Stop hold animation
    clearInterval(STATE.holdInterval);
    STATE.holdProgress = 100;

    // Disable the hold button so releasing doesn't reset it
    holdBtn.style.pointerEvents = "none";
    holdBtn.classList.remove("pressing");

    // Hide the Hold Me section immediately
    const curtainContent = document.querySelector(".curtain-content");
    curtainContent.style.opacity = "0";
    curtainContent.style.pointerEvents = "none";

    // 1. Play Background Music with fade-in volume
STATE.audio.pause();
STATE.audio.currentTime = 0;
STATE.audio.volume = 0;

try {
    await STATE.audio.play();

    let vol = 0;
    const fade = setInterval(() => {
        vol += 0.1;
        if (vol >= 1) {
            vol = 1;
            clearInterval(fade);
        }
        STATE.audio.volume = vol;
    }, 100);

} catch (e) {
    console.error(e);
}

    // 2. Open curtains
    const overlay = document.getElementById("curtain-overlay");
    overlay.classList.add("open");

    // 3. Show countdown immediately
    const countdownStage = document.getElementById("stage-countdown");
    countdownStage.style.display = "flex";
    countdownStage.classList.add("active");

    startCountdown();
}

    // Listeners for hold button interactions (Mouse & Mobile Touch)
    holdBtn.addEventListener("mousedown", triggerHoldStart);
    holdBtn.addEventListener("mouseup", triggerHoldRelease);
    holdBtn.addEventListener("mouseleave", triggerHoldRelease);

    holdBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        triggerHoldStart();
    });
    holdBtn.addEventListener("touchend", (e) => {
        e.preventDefault();
        triggerHoldRelease();
    });

    /* Countdown timer loop */
    function startCountdown() {
        let count = 3;
        const countNumEl = document.getElementById("countdown-num");
        countNumEl.textContent = count;

        const cdTimer = setInterval(() => {
            count--;
            if (count > 0) {
                countNumEl.textContent = count;
            } else {
                clearInterval(cdTimer);
                // Transition to Stage 0: Loader
                showLoaderScreen();
            }
        }, 900);
    }

    /* Loader Card display screen */
    function showLoaderScreen() {
        // Hide Countdown
        const countdownStage = document.getElementById("stage-countdown");
        countdownStage.classList.remove("active");
        countdownStage.style.display = "none";

        // Show Loader display
        const loaderStage = document.getElementById("stage-loader");
        loaderStage.style.display = "flex";
        loaderStage.classList.add("active");

        // Loader ends after 3.2s
        setTimeout(() => {
            // Transition to Stage 1: PARTY.EXE
            showStage(1);
        }, 3200);
    }

    /* ==========================================
       STAGE 1: PARTY.EXE INTRO SCREEN EVENTS
       ========================================== */
    const introNextBtn = document.getElementById("intro-next-btn");
    introNextBtn.addEventListener("click", () => {
        // Transition to Stage 2: CAKE.EXE
        showStage(2);
    });

    /* ==========================================
       STAGE 2: CAKE.EXE MINI-GAME CONTROLLER
       ========================================== */
    let sliceCanvas, ctx;
    let isDrawing = false;
    let points = [];
    let startPoint = null;
    let cakeSliceFinished = false;
    let sliceAccumulated = 0;
    let lastPoint = null;

    function initCakeSlicingGame() {
        sliceCanvas = document.getElementById("cake-slice-canvas");
        ctx = sliceCanvas.getContext("2d");
        cakeSliceFinished = false;

        // Match canvas dimensions to viewport container
        const contentBox = sliceCanvas.parentElement;
        sliceCanvas.width = contentBox.clientWidth;
        sliceCanvas.height = contentBox.clientHeight;

        // Handle window resizing
        window.addEventListener("resize", resizeSliceCanvas);

        // Reset DOM elements
        document.getElementById("cake-title-text").textContent = "Swipe to Cut the Cake! 🎂";
        const cakeInstructions = document.getElementById("cake-instructions-text");
        if (cakeInstructions) cakeInstructions.style.display = "block";
        document.getElementById("slice-progress-wrapper").style.visibility = "visible";
        document.getElementById("cake-next-wrapper").style.display = "none";

        // Hint text
        const swipeHint = document.getElementById("cake-swipe-hint");
        if (swipeHint) {
            swipeHint.classList.remove("show");
            swipeHint.style.opacity = "0";
        }

        STATE.sliceProgress = 0;
        updateSliceProgressRing();

        // Bind interaction listeners
        sliceCanvas.addEventListener("pointerdown", startCakeSlicing);
        sliceCanvas.addEventListener("pointermove", drawCakeSlicing);
        sliceCanvas.addEventListener("pointerup", stopCakeSlicing);
        sliceCanvas.addEventListener("pointerleave", stopCakeSlicing);
    }

    function resizeSliceCanvas() {
        if (!sliceCanvas || cakeSliceFinished) return;
        const contentBox = sliceCanvas.parentElement;
        sliceCanvas.width = contentBox.clientWidth;
        sliceCanvas.height = contentBox.clientHeight;
    }

    function getCanvasCoordinates(e) {
        const rect = sliceCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function startCakeSlicing(e) {
        if (cakeSliceFinished) return;
        isDrawing = true;
        points = [];
        startPoint = getCanvasCoordinates(e);
        points.push(startPoint);
        STATE.sliceProgress = 0;
        updateSliceProgressRing();

        // smoother trail state
        sliceAccumulated = 0;
        lastPoint = startPoint;

        // fade out any previous trail
        ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    }

    function drawCakeSlicing(e) {
        if (!isDrawing || cakeSliceFinished) return;

        const currentPoint = getCanvasCoordinates(e);
        points.push(currentPoint);

        // Keep last points for smooth curve
        if (points.length > 42) points.shift();

        // Clear previous trail so image shows through
        ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            const grad = ctx.createLinearGradient(points[0].x, points[0].y, currentPoint.x, currentPoint.y);
            grad.addColorStop(0, "#ff5ea6");
            grad.addColorStop(1, "rgba(255, 94, 166, 0.07)");

            ctx.lineWidth = 8;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = grad;
            ctx.shadowColor = "#ff5ea6";
            ctx.shadowBlur = 14;
            ctx.stroke();
        }

        // accumulate swipe length for progress
        if (lastPoint) {
            const stepDist = Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2));
            sliceAccumulated += stepDist;
        }
        lastPoint = currentPoint;

        // progress mapping
        // target swipe length ~ 170px (tuned for typical stage size)
        const pct = Math.min((sliceAccumulated / 100) * 100, 100);
        STATE.sliceProgress = pct;
        updateSliceProgressRing();
    }

    function stopCakeSlicing(e) {
        if (!isDrawing || cakeSliceFinished) return;
        isDrawing = false;

        const currentPoint = getCanvasCoordinates(e);
        if (lastPoint) {
            const stepDist = Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2));
            sliceAccumulated += stepDist;
        }
        lastPoint = currentPoint;

        // threshold based on accumulated swipe length
        const cutThreshold = 100;
        if (sliceAccumulated >= cutThreshold) {
            // Successful Cut!
            triggerCakeCutSuccessful();
        } else {
            // Slice reset
            ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            points = [];
            sliceAccumulated = 0;
            lastPoint = null;
            STATE.sliceProgress = 0;
            updateSliceProgressRing();
        }
    }

    function updateSliceProgressRing() {
        const sliceCircle = document.getElementById("slice-progress-bar");
        const sliceCircleTxt = document.getElementById("slice-progress-txt");
        const circ = 2 * Math.PI * 52; // 326.72

        const offset = circ - (STATE.sliceProgress / 100) * circ;
        sliceCircle.style.strokeDashoffset = offset;
        sliceCircleTxt.textContent = `${Math.round(STATE.sliceProgress)}%`;

        const swipeHint = document.getElementById("cake-swipe-hint");
        if (swipeHint) {
            if (STATE.sliceProgress > 8 && STATE.sliceProgress < 95) {
                swipeHint.classList.add("show");
            } else {
                swipeHint.classList.remove("show");
            }
        }
    }

    function triggerCakeCutSuccessful() {
        cakeSliceFinished = true;
        ctx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        window.removeEventListener("resize", resizeSliceCanvas);

        // Trigger Confetti Blast
        const confettiColors = ["#ff1f9e", "#ff5f9f", "#ff6767", "#ff6c6c", "#ff5cb0"];
        confetti({
            particleCount: 280,
            spread: 120,
            origin: { y: 0.5 },
            colors: confettiColors,
            gravity: 0.8,
            ticks: 300
        });

        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: confettiColors
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: confettiColors
            });
        }, 100);

        // Update text details
        document.getElementById("cake-title-text").innerHTML = `Happy Birthday, ${CONFIG.targetName}! 💗`;
        document.getElementById("cake-instructions-text").style.display = "none";
        document.getElementById("slice-progress-wrapper").style.visibility = "hidden";

        // Hide hint
        const swipeHint = document.getElementById("cake-swipe-hint");
        if (swipeHint) swipeHint.classList.remove("show");

        // Reveal Next button
        document.getElementById("cake-next-wrapper").style.display = "block";
    }

    const cakeNextBtn = document.getElementById("cake-next-btn");
    cakeNextBtn.addEventListener("click", () => {
        // Transition to Stage 3: GALLERY.EXE
        showStage(3);
    });

    /* ==========================================
       STAGE 3: GALLERY.EXE COVERFLOW SLIDER
       ========================================== */
    const swiper = new Swiper('.photo-swiper', {
        // baki settings...
        centeredSlides: true, // Yeh active slide ko center mein rakhega
    });
    let swiperInstance = null;

    function initGallerySwiper() {
        // Initialize Coverflow Gallery via Swiper
        if (!swiperInstance) {
            swiperInstance = new Swiper('.photo-swiper', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                coverflowEffect: {
                    rotate: 10,
                    stretch: -5,
                    depth: 100,
                    modifier: 1,
                    slideShadows: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
            });
        } else {
            swiperInstance.update();
            swiperInstance.slideTo(0, 0);
        }

        // Hide gallery next button originally, reveal after 1.2s delay
        const nextBtnWrapper = document.getElementById("gallery-next-wrapper");
        nextBtnWrapper.style.visibility = "hidden";
        nextBtnWrapper.style.opacity = "0";
        nextBtnWrapper.style.transition = "opacity 0.4s ease";

        setTimeout(() => {
            nextBtnWrapper.style.visibility = "visible";
            nextBtnWrapper.style.opacity = "1";
        }, 1200);
    }

    const galleryNextBtn = document.getElementById("gallery-next-btn");
    galleryNextBtn.addEventListener("click", () => {
        // Transition to Stage 4: LETTER.EXE
        showStage(4);
    });

    /* ==========================================
       STAGE 4: LETTER.EXE WAX SEAL UNSEALING
       ========================================== */
    const envelopeCard = document.getElementById("envelope-letter-card");
    const sealLabel = document.getElementById("wax-seal-label");
    let isUnsealing = false;

    envelopeCard.addEventListener("click", () => {
        if (isUnsealing) return;
        isUnsealing = true;

        envelopeCard.classList.add("unsealing");
        sealLabel.textContent = "UNSEALING...";

        // Envelope unsealing holds for 1.5s
        setTimeout(() => {
            envelopeCard.classList.remove("unsealing");
            sealLabel.textContent = "TAP TO OPEN";
            isUnsealing = false;

            // Open sweet letter modal box
            openLetterMessageModal();
        }, 1500);
    });

    /* ==========================================
       STAGE 4: TYPEWRITER MODAL DIALOGUE
       ========================================== */
    const modalOverlay = document.getElementById("letter-text-modal-overlay");
    const modalCloseBtn = document.getElementById("letter-modal-close");
    const typewriterEl = document.getElementById("typewriter-text");
    const letterScrollBox = document.getElementById("letter-box-scroll");
    const smileyBtn = document.getElementById("final-smiley-btn");

    let typewritingTimer = null;

    function openLetterMessageModal() {
        modalOverlay.style.display = "flex";
        // Force reflow
        void modalOverlay.offsetWidth;
        modalOverlay.classList.add("active");

        // Reset typewriter
        typewriterEl.textContent = "";
        clearInterval(typewritingTimer);

        let textIdx = 0;
        const fullText = CONFIG.letterText;

        typewritingTimer = setInterval(() => {
            textIdx++;
            typewriterEl.textContent = fullText.slice(0, textIdx);

            // Append blinking cursor
            const cursor = document.createElement("span");
            cursor.className = "retro-cursor";
            typewriterEl.appendChild(cursor);

            // Keep content scrolled down as text prints
            letterScrollBox.scrollTop = letterScrollBox.scrollHeight;

            if (textIdx >= fullText.length) {
                clearInterval(typewritingTimer);
            }
        }, 25);
    }

    function closeLetterMessageModal() {
        clearInterval(typewritingTimer);
        modalOverlay.classList.remove("active");

        // Delay display none until fade-out finishes
        setTimeout(() => {
            modalOverlay.style.display = "none";
        }, 300);
    }

    modalCloseBtn.addEventListener("click", closeLetterMessageModal);

    // Close modal on clicking outside background wrapper
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeLetterMessageModal();
        }
    });

    // Final smiley button confetti blast trigger
    smileyBtn.addEventListener("click", () => {
        const finalConfettiColors = ["#ff1f9e", "#ff5f9f", "#ff6767", "#ff6c6c", "#ff5cb0"];
        confetti({
            particleCount: 180,
            spread: 100,
            origin: { y: 0.6 },
            colors: finalConfettiColors,
            gravity: 0.85
        });

        setTimeout(() => {
            confetti({
                particleCount: 75,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.65 },
                colors: finalConfettiColors
            });
            confetti({
                particleCount: 75,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.65 },
                colors: finalConfettiColors
            });
        }, 100);
    });
} catch (e) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:12px;font-size:13px;z-index:9999;font-family:monospace;white-space:pre-wrap;';
    d.textContent = 'STARTUP ERROR: ' + e.message + '\n' + e.stack;
    document.body.appendChild(d);
}
