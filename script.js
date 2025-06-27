const tapBtn = document.getElementById('tapBtn');
    const morseDisplay = document.getElementById('morseDisplay');
    const textDisplay = document.getElementById('textDisplay');
    const speakBtn = document.getElementById('speak');
    const messageLog = document.getElementById('messageLog');
    const locationInfo = document.getElementById('locationInfo');
    const batteryInfo = document.getElementById('batteryInfo');


    let startTime = 0;
    let morseCode = "";
    let message = "";

    const audio = new AudioContext();
    function beep() {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
  
    osc.type = "sine";              // Soft, pure tone
    osc.frequency.value = 1000;     // Lower pitch for realism
  
    gain.gain.setValueAtTime(0.05, audio.currentTime); // Very soft volume (0.0 to 1.0)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.1); // fade out
  
    osc.connect(gain);
    gain.connect(audio.destination);
  
    osc.start();
    osc.stop(audio.currentTime + 0.1); // 100ms beep
  }

    const morseToChar = {
      '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D',
      '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H',
      '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
      '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P',
      '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
      '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
      '-.--': 'Y', '--..': 'Z'
    };

    const emotionMorseMap = {
        '...': "I'm OK",
        '-.-': "In Danger",
        '..-.-': "I can't move, please come quickly",
        '...-': "I am injured and need medical attention",
        '.-..': "I am safe but stuck, please guide me",
        '.-...': "Please bring water and medicine ",
        '--..': "Call my family, I need their support"
    };

    tapBtn.addEventListener('mousedown', () => {
      startTime = Date.now();
      beep();
    });

    tapBtn.addEventListener('mouseup', () => {
      const duration = Date.now() - startTime;
      const symbol = duration < 300 ? '.' : '-';
      morseCode += symbol;
      morseDisplay.textContent = morseCode;

      clearTimeout(window.morseTimeout);
      window.morseTimeout = setTimeout(() => {
        if (emotionMorseMap[morseCode]) {
          message = emotionMorseMap[morseCode];
        } else {
          const char = morseToChar[morseCode] || '?';
          message += char;
        }
        textDisplay.textContent = message;
        morseCode = '';


        // 🆕 Auto-send the message 3 seconds after last tap
    if (message.trim() !== "") {
        if (window.autoSendTimeout) clearTimeout(window.autoSendTimeout);
        window.autoSendTimeout = setTimeout(() => {
        sendMessage(); // ✅ Auto send without button
        }, 3000); // adjust delay if needed
    }

      }, 1000);
    });

    function useShortcut(word) {
      textDisplay.textContent = word;
      message = word;
    }

    speakBtn.addEventListener('click', () => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    });

    function toggleGuide() {
      const guide = document.getElementById('guideBox');
      guide.style.display = guide.style.display === 'block' ? 'none' : 'block';
    }

    function toggleInstructions() {
      const instructions = document.getElementById('instructionBox');
      instructions.style.display = instructions.style.display === 'block' ? 'none' : 'block';
    }

    function clearMessage() {
      morseCode = '';
      message = '';
      morseDisplay.textContent = '';
      textDisplay.textContent = '';
    }
    // Emergency Contacts Logic
const contacts = [
  { name: "Mom", phone: "+91 9876543210" },
  { name: "Dad", phone: "+91 9123456789" }
];

let contactTimeout;

function openContacts() {
  document.getElementById("contactsPage").style.display = "block";
  displayContacts();

  // Auto-send to first contact in 3 seconds if no interaction
  contactTimeout = setTimeout(() => {
    if (contacts.length > 0) {
        sendMessage(0);

    }
  }, 3000);
}

function closeContacts() {
  document.getElementById("contactsPage").style.display = "none";
  clearTimeout(contactTimeout);
}

function displayContacts() {
  const list = document.getElementById("contactList");
  list.innerHTML = ''; // Clear previous list
  contacts.forEach((contact, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${contact.name} - ${contact.phone}
      <button onclick="sendMessage(${index})">📤 Send</button>

    `;
    list.appendChild(li);
  });
}

function addContact() {
  const name = prompt("Enter contact name:");
  const phone = prompt("Enter phone number:");
  if (name && phone) {
    contacts.push({ name, phone });
    displayContacts();
  }
}

// function sendToContact(index) {
//   clearTimeout(contactTimeout);
//   const contact = contacts[index];
//   alert(`🚨 Message sent to ${contact.name} (${contact.phone}): "${message}"`);
//   closeContacts();
// }

function sendMessage(index = 0) {
    if (message.trim() !== "") {
    const div = document.createElement('div');
    div.className = 'message';
    div.textContent = `${message} \n(Location: ${locationInfo.textContent}, Battery: ${batteryInfo.textContent})`;

    if (messageLog) {
      messageLog.prepend(div);
    }

    const contact = contacts[index];
    if (contact) {
      alert(`🚨 Message sent to ${contact.name} (${contact.phone}): "${message}"`);
    }

    closeContacts();
    clearMessage();
  }
}
  

  // Location tracking
  // ✅ Real-time Location Tracking
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchHumanReadableLocation(latitude, longitude); // call the reverse geocode function
      },
      error => {
        locationInfo.textContent = 'Unable to access location';
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }
  
  
  // ✅ Battery Status Detection (Compatible)
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      function updateBatteryInfo() {
        const level = (battery.level * 100).toFixed(0);
        const charging = battery.charging ? ' (Charging)' : '';
        batteryInfo.textContent = `${level}%${charging}`;
      }
      updateBatteryInfo();
      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
    });
  } else {
    batteryInfo.textContent = 'Battery info not supported';
  }
  
  function fetchHumanReadableLocation(lat, lon) {
    const apiKey = '11bbcd6e853e4466a5021f6e6ec67872'; // replace with your key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const place = data.results[0]?.formatted || `${lat}, ${lon}`;
        locationInfo.textContent = place;
      })
      .catch(err => {
        locationInfo.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      });
  }
  