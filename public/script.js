// script.js
document.addEventListener('DOMContentLoaded', () => {
  const planInputs = Array.from(document.querySelectorAll('input[name="plan"]'));
  const subtotalEl = document.getElementById('subtotal');
  const gstEl = document.getElementById('gst');
  const pfEl = document.getElementById('platformFee');
  const totalEl = document.getElementById('totalAmount');
  const payBtn = document.getElementById('payBtn');
  const form = document.getElementById('regForm');

  const GST_RATE = 0.18;
  const PLATFORM_RATE = 0.02;

  // 🔹 CHANGE THESE DETAILS
  const UPI_ID = "yourupi@bank";     // e.g. sayan@paytm
  const PAYEE_NAME = "SkillShift";   // Your name / business

  function formatINR(n) {
    return '₹' + n.toFixed(2);
  }

  function recalc() {
    const selected = planInputs.find(i => i.checked);
    const base = selected ? parseFloat(selected.value) : 0;

    const gst = base * GST_RATE;
    const pf = base * PLATFORM_RATE;
    const total = base + gst + pf;

    subtotalEl.innerText = formatINR(base);
    gstEl.innerText = formatINR(gst);
    pfEl.innerText = formatINR(pf);
    totalEl.innerText = formatINR(total);

    payBtn.disabled = base === 0;
    payBtn.innerText = base === 0
      ? "Pay ₹0.00"
      : `Pay ${formatINR(total)}`;

    payBtn.dataset.amount = total.toFixed(2); // rupees
  }

  planInputs.forEach(p => p.addEventListener('change', recalc));
  recalc();

  // 📱 MOBILE-ONLY UPI PAYMENT
  payBtn.addEventListener('click', () => {
    if (!form.reportValidity()) return;

    const amount = payBtn.dataset.amount;
    if (!amount || amount <= 0) {
      alert('Please select a plan.');
      return;
    }

    const upiURL =
      `upi://pay?pa=${UPI_ID}` +
      `&pn=${encodeURIComponent(PAYEE_NAME)}` +
      `&am=${amount}` +
      `&cu=INR`;

    // 🔥 Opens GPay / PhonePe / Paytm
    window.location.href = upiURL;
  });
});
