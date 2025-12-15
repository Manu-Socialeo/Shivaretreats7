document.addEventListener('DOMContentLoaded', function () {
    // -------------------------------------------------------------------------
    // Mobile Menu Toggle (Preserved)
    // -------------------------------------------------------------------------
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------------------
    // Hero Slideshow Logic (Preserved)
    // -------------------------------------------------------------------------
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;

        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // -------------------------------------------------------------------------
    // Booking Wizard Logic (NEW)
    // -------------------------------------------------------------------------
    const wizardForm = document.getElementById('bookingWizardForm');

    // Check if we are on the booking page
    if (wizardForm) {
        let currentStep = 1;
        const totalSteps = 7;

        // Fee Structure
        const prices = {
            'Shared Cottage': 800,
            'Private Cottage': 1100,
            'Non-Residential': 600,
            'Advance': 300
        };

        // Initialize Wizard
        showStep(currentStep);

        // Global functions for inline onclick handlers
        window.nextStep = function () {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
                updateFee(); // Update fee whenever we move steps (especially to Summary)
            }
        };

        window.prevStep = function () {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        };

        window.selectOption = function (element, inputId, value) {
            // Update hidden input
            document.getElementById(inputId).value = value;

            // Visual feedback
            const siblings = element.parentElement.children;
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].classList.contains('form-option-card')) {
                    siblings[i].classList.remove('selected');
                }
            }
            element.classList.add('selected');

            // Conditional Logic for Stay Type
            if (inputId === 'stayType') {
                const accomOptions = document.getElementById('accommodationOptions');
                const accomHidden = document.getElementById('roomType');

                if (value === 'Non-Residential') {
                    // Hide Accommodation step? Or just skip it?
                    // Better interaction: Auto-set roomType to 'None' and maybe disable next step options?
                    // But simpler: Just hide the options in step 4 or handle logic.
                    // Let's handle logic: If non-res, step 4 is effectively skipped or simplified.
                    accomHidden.value = 'None';
                    // We will handle skipping logic in nextStep() if we wanted, 
                    // but for simplicity let's just let user click next on step 4 (maybe separate logic).
                    // Actually, let's keep it simple: Standard flow.
                } else {
                    accomHidden.value = ''; // Reset if going back to Residential
                }
            }
        };

        window.togglePaymentInfo = function () {
            const box = document.getElementById('paymentInfo');
            if (box.style.display === 'block') {
                box.style.display = 'none';
            } else {
                box.style.display = 'block';
            }
        };

        window.sendApplication = function () {
            // Gather Data
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const country = document.getElementById('country').value;
            const phone = document.getElementById('whatsapp').value;
            const gender = document.getElementById('gender').value;

            const course = document.getElementById('courseSelect').value;
            const startDate = document.getElementById('startDate').value;

            const stayType = document.getElementById('stayType').value;
            const roomType = document.getElementById('roomType').value;

            const details = document.getElementById('message').value;

            // Fee Calc
            let total = 0;
            if (stayType === 'Non-Residential') {
                total = prices['Non-Residential'];
            } else {
                total = prices[roomType] || 0;
            }
            const advance = prices['Advance'];
            const balance = total - advance;

            // Construct Email Body
            const subject = `Booking Application: ${name} - ${course}`;
            const body = `NAMASTE SHIVA YOGA TEAM,

I would like to apply for a course. Here are my details:

--- PERSONAL DETAILS ---
Name: ${name}
Email: ${email}
Phone/WhatsApp: ${phone}
Country: ${country}
Gender: ${gender}

--- COURSE DETAILS ---
Course: ${course}
Start Date: ${startDate}

--- ACCOMMODATION ---
Stay Type: ${stayType}
Room Preference: ${roomType}

--- FEE SUMMARY ---
Total Fee: €${total}
Advance Paid: €${300} (Check Screenshot or Pending)
Balance Due: €${balance}

--- MESSAGE ---
${details}

---------------------------------
Please confirm my booking.
`;

            // Open Mailto
            window.open(`mailto:contact@shivaretreats.com?cc=contact@shivaretreats.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        };

        window.updateFee = function () {
            const stayType = document.getElementById('stayType').value;
            const roomType = document.getElementById('roomType').value;
            const course = document.getElementById('courseSelect').value;

            // Display Texts
            document.getElementById('summaryCourse').innerText = course || 'Not Selected';

            let total = 0;
            let roomText = '-';

            if (stayType === 'Non-Residential') {
                total = prices['Non-Residential'];
                roomText = 'Non-Residential (Course Only)';
            } else {
                if (roomType) {
                    total = prices[roomType] || 0;
                    roomText = `Residential - ${roomType}`;
                } else {
                    roomText = 'Residential (No Room Selected)';
                }
            }

            document.getElementById('summaryRoom').innerText = roomText;
            document.getElementById('totalFee').innerText = '€' + total;
        };

        function showStep(n) {
            // Validate limits
            if (n < 1) n = 1;
            if (n > totalSteps) n = totalSteps;

            // Hide all steps
            const steps = document.querySelectorAll('.wizard-step-content');
            steps.forEach(step => step.classList.remove('active'));

            // Show current step
            const currentStepEl = document.querySelector(`.wizard-step-content[data-step="${n}"]`);
            if (currentStepEl) {
                currentStepEl.classList.add('active');
            }

            // Update Progress Bar
            const progress = ((n - 1) / (totalSteps - 1)) * 100;
            document.getElementById('progressFill').style.width = progress + '%';

            // Special Handling (Skip Step 4 if Non-Residential)
            // If we are at Step 4 and stayType is Non-Residential, auto-skip to 5
            if (n === 4) {
                const stay = document.getElementById('stayType').value;
                if (stay === 'Non-Residential') {
                    // If moving forward (prev step was 3), go next
                    // Checks are tricky here inside showStep. 
                    // Better logic: handle this in nextStep/prevStep. 
                    // But for now, let's just let user click "Next" on Step 4 (maybe hide options).
                    const opts = document.getElementById('accommodationOptions');
                    if (stay === 'Non-Residential') {
                        opts.style.display = 'none';
                        // Add a temporary text
                        if (!document.getElementById('nonResMsg')) {
                            const msg = document.createElement('p');
                            msg.id = 'nonResMsg';
                            msg.innerText = "You selected Non-Residential. No accommodation selection needed.";
                            msg.style.textAlign = 'center';
                            opts.parentNode.insertBefore(msg, opts);
                        }
                    } else {
                        opts.style.display = 'block';
                        const msg = document.getElementById('nonResMsg');
                        if (msg) msg.remove();
                    }
                }
            }
        }

        function validateStep(n) {
            const stepEl = document.querySelector(`.wizard-step-content[data-step="${n}"]`);
            const inputs = stepEl.querySelectorAll('input, select');
            let valid = true;

            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value) {
                    valid = false;
                    input.style.borderColor = 'red';
                    // Reset color on input
                    input.addEventListener('input', function () {
                        this.style.borderColor = '#ddd';
                    });
                }
            });

            // Specific check for roomType on Step 4
            if (n === 4) {
                const stay = document.getElementById('stayType').value;
                const room = document.getElementById('roomType').value;
                if (stay === 'Residential' && !room) {
                    alert("Please select a room type.");
                    valid = false;
                }
            }

            if (!valid) {
                // Only alert for general inputs if you want, or just rely on red borders
                // alert("Please fill in all required fields.");
            }
            return valid;
        }
    }
});

// -------------------------------------------------------------------------
// Global Helper for Teachers Section Scroll
// -------------------------------------------------------------------------
window.scrollSection = function (id, distance) {
    const container = document.getElementById(id);
    if (container) {
        container.scrollBy({ left: distance, behavior: 'smooth' });
    }
};
