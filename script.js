/**
 * BIRTHDAY APPLICATION CORE
 * Completely rewritten from scratch using clean, optimized modern ES6.
 * Zero placeholders, strict performance optimizations, and comprehensive error handling.
 */

// Global error catcher - shows errors visibly on the page for easier debugging
window.onerror = function (msg, src, line, col, err) {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:12px;font-size:13px;z-index:9999;font-family:monospace;';
    d.textContent = `JS ERROR: ${msg} (line ${line})`;
    document.body.appendChild(d);
    return false;
};

(() => {
    'use strict';

    /* ==========================================
       APPLICATION CONFIGURATION
       ========================================== */
    const CONFIG = {
        targetName: "My girl",
        age: 20,
        musicUrl: "song.mp3",
        introGifUrl: "1.gif",
        cakeGifUrl: "2.gif",
        loaderImageUrl: "hello_kitty.png",
        letterText: `My favorite person 🐼

You know, having you in my life makes everything feel a little brighter and a lot more beautiful 🫶

I love the way you make me smile, the way you make ordinary moments feel special, and the way you somehow make my heart feel at home 😌

I want us to share unlimited laughs, love, silly fights, late-night talks, and countless beautiful memories together 🧿😚

Thank you for being my comfort, my happiness, and my favorite person in every sense ❤️

I love you forever and ever and ever ♾️😘😘❤️🧿`
    };

    /* ==========================================
       APPLICATION CORE STATE
       ========================================== */
    const STATE = {
        step: 0,
        holdProgress: 0,
        holdInterval: null,
        audio: null,
        audioFadeInterval: null,
        sliceProgress: 0,
        swiperInstance: null,
        heartInterval: null,
        typewritingTimer: null,
        cakeGame: {
            canvas: null,
            ctx: null,
            isDrawing: false,
            points: [],
            sliceAccumulated: 0,
            lastPoint: null,
            isFinished: false,
            resizeHandler: null,
            boundDown: null,
            boundMove: null,
            boundUp: null
        }
    };

    /* ==========================================
       DOM CACHE MANAGEMENT
       ========================================== */
    const DOM = {
        loaderImg: document.getElementById("loader-display-img"),
        introGif: document.getElementById("intro-gif-display"),
        cakeGif: document.getElementById("cake-gif-display"),
        introTitle: document.getElementById("intro-title-text"),
        heartsContainer: document.getElementById("hearts-container"),
        headerTitle: document.getElementById("window-header-title"),
        curtainOverlay: document.getElementById("curtain-overlay"),
        curtainContent: document.querySelector(".curtain-content"),
        countdownStage: document.getElementById("stage-countdown"),
        loaderStage: document.getElementById("stage-loader"),
        partyStage: document.getElementById("stage-party"),
        cakeStage: document.getElementById("stage-cake"),
        galleryStage: document.getElementById("stage-gallery"),
        letterStage: document.getElementById("stage-letter"),
        holdBtn: document.getElementById("hold-active-btn"),
        progressCircle: document.getElementById("hold-progress-bar"),
        countdownNum: document.getElementById("countdown-num"),
        introNextBtn: document.getElementById("intro-next-btn"),
        cakeCanvas: document.getElementById("cake-slice-canvas"),
        cakeTitle: document.getElementById("cake-title-text"),
        cakeInstructions: document.getElementById("cake-instructions-text"),
        sliceProgressWrapper: document.getElementById("slice-progress-wrapper"),
        cakeNextWrapper: document.getElementById("cake-next-wrapper"),
        cakeSwipeHint: document.getElementById("cake-swipe-hint"),
        sliceCircle: document.getElementById("slice-progress-bar"),
        sliceCircleTxt: document.getElementById("slice-progress-txt"),
        cakeNextBtn: document.getElementById("cake-next-btn"),
        galleryNextWrapper: document.getElementById("gallery-next-wrapper"),
        galleryNextBtn: document.getElementById("gallery-next-btn"),
        envelopeCard: document.getElementById("envelope-letter-card"),
        sealLabel: document.getElementById("wax-seal-label"),
        modalOverlay: document.getElementById("letter-text-modal-overlay"),
        modalCloseBtn: document.getElementById("letter-modal-close"),
        typewriterEl: document.getElementById("typewriter-text"),
        letterScrollBox: document.getElementById("letter-box-scroll"),
        smileyBtn: document.getElementById("final-smiley-btn")
    };

    /* ==========================================
       INITIALIZATION
       ========================================== */
    const initApp = () => {
        // Prepopulate configuration items
        if (DOM.loaderImg) DOM.loaderImg.src = CONFIG.loaderImageUrl;
        if (DOM.introGif) DOM.introGif.src = CONFIG.introGifUrl;
        if (DOM.cakeGif) DOM.cakeGif.src = CONFIG.cakeGifUrl;
        if (DOM.introTitle) DOM.introTitle.textContent = `${CONFIG.targetName} was born ${CONFIG.age} years ago today!`;

        // Initialize unique global background audio system safely
        initAudioSystem();

        // Start core global system animations
        startHeartSpawner();

        // Setup base event registrations
        setupCoreEventListeners();

        // Set layout viewport entry stage
        showStage(0);
    };

    /* ==========================================
       AUDIO SYSTEM (SINGLE INSTANCE & BULLETPROOF)
       ========================================== */
    const initAudioSystem = () => {
        try {
            STATE.audio = new Audio();
            STATE.audio.src = CONFIG.musicUrl;
            STATE.audio.loop = true;
            STATE.audio.autoplay = false;
            STATE.audio.preload = "auto";
            STATE.audio.volume = 0;
        } catch (err) {
            console.error("Audio core allocation standard failure:", err);
        }
    };

    const playMusicWithFadeIn = () => {
        if (!STATE.audio) return;

        clearInterval(STATE.audioFadeInterval);
        
        // Audio execution context wrapper ensuring desktop/mobile compatibility
        STATE.audio.play().then(() => {
            let vol = 0;
            STATE.audio.volume = vol;
            STATE.audioFadeInterval = setInterval(() => {
                if (vol < 0.9) {
                    vol += 0.05;
                    STATE.audio.volume = Math.min(vol, 1.0);
                } else {
                    STATE.audio.volume = 1.0;
                    clearInterval(STATE.audioFadeInterval);
                }
            }, 50);
        }).catch(err => {
            console.warn("Audio automatic interaction flag interrupted execution:", err);
        });
    };

    /* ==========================================
       PARTICLE SPARK SYSTEM (FLOATING HEARTS)
       ========================================== */
    const spawnHeart = () => {
        if (!DOM.heartsContainer) return;

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

        const colors = ["#ff5ea6", "#ffccd5", "#ff8ab9", "#d4789c"];
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];

        DOM.heartsContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000);
    };

    const startHeartSpawner = () => {
        clearInterval(STATE.heartInterval);
        STATE.heartInterval = setInterval(spawnHeart, 500);
    };

    /* ==========================================
       STAGE CONTROLLER MACHINE
       ========================================== */
    const showStage = (stepNumber) => {
        STATE.step = stepNumber;

        const titles = ["SEAL.EXE", "PARTY.EXE", "CAKE.EXE", "GALLERY.EXE", "LETTER.EXE"];
        if (DOM.headerTitle) {
            DOM.headerTitle.textContent = titles[stepNumber] || "SURPRISE.EXE";
        }

        const viewStages = [
            DOM.partyStage,
            DOM.cakeStage,
            DOM.galleryStage,
            DOM.letterStage
        ];

        // Soft stage reset sequences avoiding layouts breaks
        viewStages.forEach(stage => {
            if (!stage) return;
            stage.classList.remove("active");
            stage.style.display = "none";
        });

        if (DOM.curtainOverlay) {
            DOM.curtainOverlay.style.pointerEvents = (stepNumber === 0) ? "auto" : "none";
        }

        switch (stepNumber) {
            case 0:
                if (DOM.curtainOverlay) {
                    DOM.curtainOverlay.classList.remove("open");
                    DOM.curtainOverlay.style.display = "flex";
                    DOM.curtainOverlay.classList.add("active");
                }
                if (DOM.curtainContent) {
                    DOM.curtainContent.style.opacity = "1";
                    DOM.curtainContent.style.pointerEvents = "all";
                }
                break;

            case 1:
                if (DOM.partyStage) {
                    DOM.partyStage.style.display = "flex";
                    void DOM.partyStage.offsetWidth;
                    DOM.partyStage.classList.add("active");
                }
                break;

            case 2:
                if (DOM.cakeStage) {
                    DOM.cakeStage.style.display = "flex";
                    void DOM.cakeStage.offsetWidth;
                    DOM.cakeStage.classList.add("active");
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => initCakeSlicingGame());
                    });
                }
                break;

            case 3:
                if (DOM.galleryStage) {
                    DOM.galleryStage.style.display = "flex";
                    void DOM.galleryStage.offsetWidth;
                    DOM.galleryStage.classList.add("active");
                    initGallerySwiper();
                }
                break;

            case 4:
                if (DOM.letterStage) {
                    DOM.letterStage.style.display = "flex";
                    void DOM.letterStage.offsetWidth;
                    DOM.letterStage.classList.add("active");
                }
                break;
        }
    };

    /* ==========================================
       STAGE 0: PROGRESS PRESS AND HOLD ENGINE
       ========================================== */
    const maxCircumference = 263.89; // 2 * Math.PI * 42

    const updateHoldProgressRing = () => {
        if (!DOM.progressCircle) return;
        const offset = maxCircumference - (STATE.holdProgress / 100) * maxCircumference;
        DOM.progressCircle.style.strokeDashoffset = offset;
    };

    const triggerHoldStart = () => {
        if (DOM.holdBtn) DOM.holdBtn.classList.add("pressing");
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
    };

    const triggerHoldRelease = () => {
        if (STATE.holdProgress >= 100) return; // Prevent loop collisions if triggered successfully

        if (DOM.holdBtn) DOM.holdBtn.classList.remove("pressing");
        clearInterval(STATE.holdInterval);

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
    };

    const triggerHoldDone = () => {
        clearInterval(STATE.holdInterval);
        STATE.holdProgress = 100;
        updateHoldProgressRing();

        if (DOM.holdBtn) {
            DOM.holdBtn.style.pointerEvents = "none";
            DOM.holdBtn.classList.remove("pressing");
        }

        if (DOM.curtainContent) {
            DOM.curtainContent.style.opacity = "0";
            DOM.curtainContent.style.pointerEvents = "none";
        }

        // Engage audio framework context safely
        playMusicWithFadeIn();

        if (DOM.curtainOverlay) {
            DOM.curtainOverlay.classList.add("open");
        }

        if (DOM.countdownStage) {
            DOM.countdownStage.style.display = "flex";
            DOM.countdownStage.classList.add("active");
        }

        startCountdown();
    };

    const startCountdown = () => {
        let count = 3;
        if (DOM.countdownNum) DOM.countdownNum.textContent = count;

        const cdTimer = setInterval(() => {
            count--;
            if (count > 0) {
                if (DOM.countdownNum) DOM.countdownNum.textContent = count;
            } else {
                clearInterval(cdTimer);
                showLoaderScreen();
            }
        }, 900);
    };

    const showLoaderScreen = () => {
        if (DOM.countdownStage) {
            DOM.countdownStage.classList.remove("active");
            DOM.countdownStage.style.display = "none";
        }

        if (DOM.loaderStage) {
            DOM.loaderStage.style.display = "flex";
            DOM.loaderStage.classList.add("active");
        }

        setTimeout(() => {
            if (DOM.loaderStage) {
                DOM.loaderStage.classList.remove("active");
                DOM.loaderStage.style.display = "none";
            }
            showStage(1);
        }, 3200);
    };

    /* ==========================================
       STAGE 2: SMOOTH CAKE SLICING MINI-GAME
       ========================================== */
    const initCakeSlicingGame = () => {
        const game = STATE.cakeGame;
        game.canvas = DOM.cakeCanvas;
        if (!game.canvas) return;

        game.ctx = game.canvas.getContext("2d");
        game.isFinished = false;
        game.isDrawing = false;
        game.points = [];
        game.sliceAccumulated = 0;
        game.lastPoint = null;

        // Cleanup any pre-existing event listeners completely before rebinding
        destroyCakeSlicingListeners();

        // Scale dynamically onto structural bounds
        resizeSliceCanvas();

        // Set state handler wrapper to clear allocation arrays cleanly on view updates
        game.resizeHandler = () => resizeSliceCanvas();
        window.addEventListener("resize", game.resizeHandler);

        // Reset dynamic text displays
        if (DOM.cakeTitle) DOM.cakeTitle.textContent = "Swipe to Cut the Cake! 🎂";
        if (DOM.cakeInstructions) DOM.cakeInstructions.style.display = "block";
        if (DOM.sliceProgressWrapper) DOM.sliceProgressWrapper.style.visibility = "visible";
        if (DOM.cakeNextWrapper) DOM.cakeNextWrapper.style.display = "none";
        if (DOM.cakeSwipeHint) {
            DOM.cakeSwipeHint.classList.remove("show");
            DOM.cakeSwipeHint.style.opacity = "0";
        }

        STATE.sliceProgress = 0;
        updateSliceProgressRing();

        // Cache safe reference mappings for perfect teardowns
        game.boundDown = (e) => startCakeSlicing(e);
        game.boundMove = (e) => drawCakeSlicing(e);
        game.boundUp = (e) => stopCakeSlicing(e);

        game.canvas.addEventListener("pointerdown", game.boundDown);
        game.canvas.addEventListener("pointermove", game.boundMove);
        game.canvas.addEventListener("pointerup", game.boundUp);
        game.canvas.addEventListener("pointerleave", game.boundUp);
    };

    const destroyCakeSlicingListeners = () => {
        const game = STATE.cakeGame;
        if (game.resizeHandler) {
            window.removeEventListener("resize", game.resizeHandler);
            game.resizeHandler = null;
        }
        if (game.canvas) {
            if (game.boundDown) game.canvas.removeEventListener("pointerdown", game.boundDown);
            if (game.boundMove) game.canvas.removeEventListener("pointermove", game.boundMove);
            if (game.boundUp) {
                game.canvas.removeEventListener("pointerup", game.boundUp);
                game.canvas.removeEventListener("pointerleave", game.boundUp);
            }
        }
        game.boundDown = null;
        game.boundMove = null;
        game.boundUp = null;
    };

    const resizeSliceCanvas = () => {
        const game = STATE.cakeGame;
        if (!game.canvas || game.isFinished) return;
        const contentBox = game.canvas.parentElement;
        if (contentBox) {
            game.canvas.width = contentBox.clientWidth;
            game.canvas.height = contentBox.clientHeight;
        }
    };

    const getCanvasCoordinates = (e) => {
        const game = STATE.cakeGame;
        if (!game.canvas) return { x: 0, y: 0 };
        const rect = game.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startCakeSlicing = (e) => {
        const game = STATE.cakeGame;
        if (game.isFinished) return;
        
        game.canvas.setPointerCapture(e.pointerId);
        game.isDrawing = true;
        game.points = [];
        game.sliceAccumulated = 0;
        
        const startPoint = getCanvasCoordinates(e);
        game.points.push(startPoint);
        game.lastPoint = startPoint;

        STATE.sliceProgress = 0;
        updateSliceProgressRing();

        if (game.ctx) {
            game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        }
    };

    const drawCakeSlicing = (e) => {
        const game = STATE.cakeGame;
        if (!game.isDrawing || game.isFinished || !game.ctx) return;

        const currentPoint = getCanvasCoordinates(e);
        game.points.push(currentPoint);

        if (game.points.length > 40) game.points.shift();

        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        if (game.points.length > 1) {
            game.ctx.beginPath();
            game.ctx.moveTo(game.points[0].x, game.points[0].y);
            for (let i = 1; i < game.points.length; i++) {
                game.ctx.lineTo(game.points[i].x, game.points[i].y);
            }

            const grad = game.ctx.createLinearGradient(game.points[0].x, game.points[0].y, currentPoint.x, currentPoint.y);
            grad.addColorStop(0, "#ff5ea6");
            grad.addColorStop(1, "rgba(255, 94, 166, 0.07)");

            game.ctx.lineWidth = 8;
            game.ctx.lineCap = "round";
            game.ctx.lineJoin = "round";
            game.ctx.strokeStyle = grad;
            game.ctx.shadowColor = "#ff5ea6";
            game.ctx.shadowBlur = 14;
            game.ctx.stroke();
        }

        if (game.lastPoint) {
            const stepDist = Math.hypot(currentPoint.x - game.lastPoint.x, currentPoint.y - game.lastPoint.y);
            game.sliceAccumulated += stepDist;
        }
        game.lastPoint = currentPoint;

        STATE.sliceProgress = Math.min((game.sliceAccumulated / 120) * 100, 100);
        updateSliceProgressRing();
    };

    const stopCakeSlicing = (e) => {
        const game = STATE.cakeGame;
        if (!game.isDrawing || game.isFinished) return;
        game.isDrawing = false;
        
        try {
            game.canvas.releasePointerCapture(e.pointerId);
        } catch (err) {}

        const cutThreshold = 120; 
        if (game.sliceAccumulated >= cutThreshold) {
            triggerCakeCutSuccessful();
        } else {
            if (game.ctx) game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
            game.points = [];
            game.sliceAccumulated = 0;
            game.lastPoint = null;
            STATE.sliceProgress = 0;
            updateSliceProgressRing();
        }
    };

    const updateSliceProgressRing = () => {
        if (!DOM.sliceCircle || !DOM.sliceCircleTxt) return;
        const circ = 2 * Math.PI * 52; 
        const offset = circ - (STATE.sliceProgress / 100) * circ;
        
        DOM.sliceCircle.style.strokeDashoffset = offset;
        DOM.sliceCircleTxt.textContent = `${Math.round(STATE.sliceProgress)}%`;

        if (DOM.cakeSwipeHint) {
            if (STATE.sliceProgress > 8 && STATE.sliceProgress < 95) {
                DOM.cakeSwipeHint.classList.add("show");
            } else {
                DOM.cakeSwipeHint.classList.remove("show");
            }
        }
    };

    const triggerCakeCutSuccessful = () => {
        const game = STATE.cakeGame;
        game.isFinished = true;
        
        if (game.ctx) game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        destroyCakeSlicingListeners();

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
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: confettiColors });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: confettiColors });
        }, 100);

        if (DOM.cakeTitle) DOM.cakeTitle.innerHTML = `Happy Birthday, ${CONFIG.targetName}! 💗`;
        if (DOM.cakeInstructions) DOM.cakeInstructions.style.display = "none";
        if (DOM.sliceProgressWrapper) DOM.sliceProgressWrapper.style.visibility = "hidden";
        if (DOM.cakeSwipeHint) DOM.cakeSwipeHint.classList.remove("show");
        if (DOM.cakeNextWrapper) DOM.cakeNextWrapper.style.display = "block";
    };

    /* ==========================================
       STAGE 3: COVERFLOW PHOTO SLIDER (SWIPER)
       ========================================== */
    const initGallerySwiper = () => {
        // Safe check to avoid duplicate initializations
        if (!STATE.swiperInstance) {
            STATE.swiperInstance = new Swiper('.photo-swiper', {
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
            STATE.swiperInstance.update();
            STATE.swiperInstance.slideTo(0, 0);
        }

        if (DOM.galleryNextWrapper) {
            DOM.galleryNextWrapper.style.visibility = "hidden";
            DOM.galleryNextWrapper.style.opacity = "0";
            DOM.galleryNextWrapper.style.transition = "opacity 0.4s ease";

            setTimeout(() => {
                DOM.galleryNextWrapper.style.visibility = "visible";
                DOM.galleryNextWrapper.style.opacity = "1";
            }, 1200);
        }
    };

    /* ==========================================
       STAGE 4: LOVE LETTER MODAL WAX ENGINE
       ========================================== */
    const handleEnvelopeUnsealing = () => {
        if (STATE.envelopeUnsealingActive) return;
        STATE.envelopeUnsealingActive = true;

        if (DOM.envelopeCard) DOM.envelopeCard.classList.add("unsealing");
        if (DOM.sealLabel) DOM.sealLabel.textContent = "UNSEALING...";

        setTimeout(() => {
            if (DOM.envelopeCard) DOM.envelopeCard.classList.remove("unsealing");
            if (DOM.sealLabel) DOM.sealLabel.textContent = "TAP TO OPEN";
            STATE.envelopeUnsealingActive = false;

            openLetterMessageModal();
        }, 1500);
    };

    const openLetterMessageModal = () => {
        if (!DOM.modalOverlay) return;

        DOM.modalOverlay.style.display = "flex";
        void DOM.modalOverlay.offsetWidth;
        DOM.modalOverlay.classList.add("active");

        if (DOM.typewriterEl) DOM.typewriterEl.textContent = "";
        clearInterval(STATE.typewritingTimer);

        let textIdx = 0;
        const fullText = CONFIG.letterText;

        STATE.typewritingTimer = setInterval(() => {
            textIdx++;
            if (DOM.typewriterEl) {
                DOM.typewriterEl.textContent = fullText.slice(0, textIdx);

                const cursor = document.createElement("span");
                cursor.className = "retro-cursor";
                DOM.typewriterEl.appendChild(cursor);
            }

            if (DOM.letterScrollBox) {
                DOM.letterScrollBox.scrollTop = DOM.letterScrollBox.scrollHeight;
            }

            if (textIdx >= fullText.length) {
                clearInterval(STATE.typewritingTimer);
            }
        }, 25);
    };

    const closeLetterMessageModal = () => {
        clearInterval(STATE.typewritingTimer);
        if (DOM.modalOverlay) {
            DOM.modalOverlay.classList.remove("active");
            setTimeout(() => {
                DOM.modalOverlay.style.display = "none";
            }, 300);
        }
    };

    /* ==========================================
       EVENT LISTENERS CORE MANAGEMENT
       ========================================== */
    const setupCoreEventListeners = () => {
        // Stage 0 hold button bindings
        if (DOM.holdBtn) {
            DOM.holdBtn.addEventListener("mousedown", triggerHoldStart);
            DOM.holdBtn.addEventListener("mouseup", triggerHoldRelease);
            DOM.holdBtn.addEventListener("mouseleave", triggerHoldRelease);

            DOM.holdBtn.addEventListener("touchstart", (e) => {
                e.preventDefault();
                triggerHoldStart();
            }, { passive: false });

            DOM.holdBtn.addEventListener("touchend", (e) => {
                e.preventDefault();
                triggerHoldRelease();
            }, { passive: false });
        }

        // Stage 1 transitioning mechanics
        if (DOM.introNextBtn) {
            DOM.introNextBtn.addEventListener("click", () => showStage(2));
        }

        // Stage 2 game transition mechanics
        if (DOM.cakeNextBtn) {
            DOM.cakeNextBtn.addEventListener("click", () => showStage(3));
        }

        // Stage 3 gallery navigation interface
        if (DOM.galleryNextBtn) {
            DOM.galleryNextBtn.addEventListener("click", () => showStage(4));
        }

        // Stage 4 letter unsealing interactions
        if (DOM.envelopeCard) {
            DOM.envelopeCard.addEventListener("click", handleEnvelopeUnsealing);
        }

        if (DOM.modalCloseBtn) {
            DOM.modalCloseBtn.addEventListener("click", closeLetterMessageModal);
        }

        if (DOM.modalOverlay) {
            DOM.modalOverlay.addEventListener("click", (e) => {
                if (e.target === DOM.modalOverlay) {
                    closeLetterMessageModal();
                }
            });
        }

        // Final celebratory confetti actions
        if (DOM.smileyBtn) {
            DOM.smileyBtn.addEventListener("click", () => {
                const finalConfettiColors = ["#ff1f9e", "#ff5f9f", "#ff6767", "#ff6c6c", "#ff5cb0"];
                confetti({
                    particleCount: 180,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: finalConfettiColors,
                    gravity: 0.85
                });

                setTimeout(() => {
                    confetti({ particleCount: 75, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: finalConfettiColors });
                    confetti({ particleCount: 75, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: finalConfettiColors });
                }, 100);
            });
        }
    };

    // Execute application load when DOM context is fully assembled
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();
