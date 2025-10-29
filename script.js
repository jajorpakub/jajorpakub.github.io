// Funkcjonalności strony wsparcia

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    updateLastModified();
    loadUpdatesFromStorage();
    initializeUpdateForm();
    updateLastUpdatePreview(); // Nowa funkcja dla preview
    initializeHospitalizationTimer(); // Timer hospitalizacji
    
    // Sprawdź czy admin był zalogowany
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
        const adminSection = document.getElementById('admin-section');
        const showButton = document.getElementById('show-admin');
        if (adminSection && showButton) {
            adminSection.style.display = 'block';
            showButton.style.display = 'none';
        }
    }
});

// Aktualizacja preview ostatniej aktualizacji na stronie głównej
function updateLastUpdatePreview() {
    const lastUpdatePreview = document.getElementById('last-update-preview');
    if (lastUpdatePreview) {
        const updates = getUpdatesFromStorage();
        if (updates.length > 0) {
            const lastUpdate = new Date(updates[0].date);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            };
            lastUpdatePreview.textContent = lastUpdate.toLocaleDateString('pl-PL', options);
        } else {
            lastUpdatePreview.textContent = 'Brak aktualizacji';
        }
    }
}

// Aktualizacja daty ostatniej modyfikacji
function updateLastModified() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        lastUpdateElement.textContent = now.toLocaleDateString('pl-PL', options);
    }
}

// Przełączanie panelu administratora
function toggleAdmin() {
    const adminSection = document.getElementById('admin-section');
    const showButton = document.getElementById('show-admin');
    
    if (adminSection.style.display === 'none' || adminSection.style.display === '') {
        // Sprawdź hasło przed pokazaniem panelu
        const password = prompt('Wprowadź hasło aby dodać aktualizację:');
        const correctPassword = 'Anna123'; // Proste hasło dla mamy
        
        if (password !== correctPassword) {
            alert('Nieprawidłowe hasło! Skontaktuj się z administratorem.');
            return;
        }
        
        adminSection.style.display = 'block';
        showButton.style.display = 'none';
        
        // Zapisz stan logowania
        localStorage.setItem('isAdminLoggedIn', 'true');
        
        // Odśwież widok aktualizacji (pokaż przyciski usuwania)
        refreshUpdatesView();
        
        // Fokus na pole tekstowe dla wygody
        setTimeout(() => {
            const textarea = document.getElementById('update-text');
            if (textarea) textarea.focus();
        }, 100);
        
    } else {
        adminSection.style.display = 'none';
        showButton.style.display = 'block';
        
        // Usuń stan logowania
        localStorage.setItem('isAdminLoggedIn', 'false');
        
        // Odśwież widok aktualizacji (ukryj przyciski usuwania)
        refreshUpdatesView();
    }
}

// Odświeżanie widoku aktualizacji (pokazanie/ukrycie przycisków usuwania)
function refreshUpdatesView() {
    const updatesContainer = document.getElementById('updates-container');
    if (!updatesContainer) return;
    
    // Wyczyść kontener
    updatesContainer.innerHTML = '';
    
    // Załaduj ponownie aktualizacje z uwzględnieniem stanu logowania
    loadUpdatesFromStorage();
}

// Inicjalizacja formularza aktualizacji
function initializeUpdateForm() {
    const form = document.getElementById('update-form');
    if (form) {
        form.addEventListener('submit', handleUpdateSubmission);
    }
}

// Obsługa dodawania nowych aktualizacji
function handleUpdateSubmission(event) {
    event.preventDefault();
    
    const textarea = document.getElementById('update-text');
    let updateText = textarea.value.trim();
    
    // Jeśli to HTML z Quill, usuń puste tagi
    if (updateText.startsWith('<p>') && updateText !== '<p><br></p>') {
        updateText = updateText.replace(/<p><br><\/p>/g, '').replace(/^<p>|<\/p>$/g, '');
        if (updateText === '' || updateText === '<br>') {
            alert('Proszę wprowadzić treść aktualizacji.');
            return;
        }
    } else if (updateText === '' || updateText === '<p><br></p>') {
        alert('Proszę wprowadzić treść aktualizacji.');
        return;
    }
    
    addNewUpdate(updateText);
    textarea.value = '';
    
    // Wyczyść też edytor Quill jeśli istnieje
    if (typeof quill !== 'undefined' && quill) {
        quill.setContents([]);
    }
    
    toggleAdmin();
    
    // Potwierdzenie dla użytkownika
    alert('Aktualizacja została dodana pomyślnie! ✅');
}

// Dodawanie nowej aktualizacji
function addNewUpdate(text) {
    const updatesContainer = document.getElementById('updates-container');
    const now = new Date();
    const dateString = formatDate(now);
    const updateId = Date.now(); // Unikalny ID dla aktualizacji
    
    // Tworzenie nowego elementu aktualizacji
    const updateElement = document.createElement('div');
    updateElement.className = 'update-item';
    updateElement.setAttribute('data-update-id', updateId);
    updateElement.innerHTML = `
        <div class="update-date">${dateString}</div>
        <div class="update-content">
            <p>${formatUpdateText(text)}</p>
        </div>
        <button class="delete-update-btn" onclick="deleteUpdate(${updateId})" title="Usuń aktualizację">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Dodanie na początku listy
    const firstUpdate = updatesContainer.querySelector('.update-item');
    if (firstUpdate) {
        updatesContainer.insertBefore(updateElement, firstUpdate);
    } else {
        updatesContainer.appendChild(updateElement);
    }
    
    // Zapisanie do localStorage z ID
    saveUpdateToStorage(text, now, updateId);
    
    // Aktualizacja daty ostatniej modyfikacji
    updateLastModified();
    
    // Animacja pojawienia się
    updateElement.style.opacity = '0';
    updateElement.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        updateElement.style.transition = 'all 0.5s ease';
        updateElement.style.opacity = '1';
        updateElement.style.transform = 'translateY(0)';
    }, 100);
}

// Formatowanie daty
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('pl-PL', options);
}

// Formatowanie tekstu aktualizacji (zamiana enter na <br>)
function formatUpdateText(text) {
    return text.replace(/\n/g, '<br>');
}

// Zapisywanie aktualizacji do localStorage
function saveUpdateToStorage(text, date, updateId = null) {
    let updates = getUpdatesFromStorage();
    const newUpdate = {
        text: text,
        date: date.toISOString(),
        id: updateId || Date.now()
    };
    updates.unshift(newUpdate);
    
    // Ograniczenie do 50 najnowszych aktualizacji
    if (updates.length > 50) {
        updates = updates.slice(0, 50);
    }
    
    localStorage.setItem('familyUpdates', JSON.stringify(updates));
}

// Pobieranie aktualizacji z localStorage
function getUpdatesFromStorage() {
    const stored = localStorage.getItem('familyUpdates');
    return stored ? JSON.parse(stored) : [];
}

// Ładowanie aktualizacji z localStorage przy starcie
function loadUpdatesFromStorage() {
    const updates = getUpdatesFromStorage();
    const updatesContainer = document.getElementById('updates-container');
    
    if (updates.length === 0) {
        return; // Pozostaw przykładową aktualizację
    }
    
    // Usuń przykładową aktualizację
    const exampleUpdate = updatesContainer.querySelector('.update-item');
    if (exampleUpdate && exampleUpdate.querySelector('.update-content em')) {
        exampleUpdate.remove();
    }
    
    // Sprawdź czy użytkownik jest zalogowany jako admin
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    
    // Dodaj zapisane aktualizacje
    updates.forEach(update => {
        const date = new Date(update.date);
        const updateElement = document.createElement('div');
        updateElement.className = 'update-item';
        updateElement.setAttribute('data-update-id', update.id || Date.now());
        
        updateElement.innerHTML = `
            <div class="update-date">${formatDate(date)}</div>
            <div class="update-content">
                <p>${formatUpdateText(update.text)}</p>
            </div>
            ${isAdmin ? `<button class="delete-update-btn" onclick="deleteUpdate(${update.id || Date.now()})" title="Usuń aktualizację">
                <i class="fas fa-trash"></i>
            </button>` : ''}
        `;
        updatesContainer.appendChild(updateElement);
    });
}

// Funkcja usuwania aktualizacji
function deleteUpdate(updateId) {
    // Sprawdź czy użytkownik jest zalogowany jako admin
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdmin) {
        alert('Brak uprawnień do usuwania aktualizacji.');
        return;
    }
    
    // Potwierdź usunięcie
    if (!confirm('Czy na pewno chcesz usunąć tę aktualizację?')) {
        return;
    }
    
    // Usuń z localStorage
    let updates = getUpdatesFromStorage();
    updates = updates.filter(update => update.id !== updateId);
    localStorage.setItem('familyUpdates', JSON.stringify(updates));
    
    // Usuń element z DOM
    const updateElement = document.querySelector(`[data-update-id="${updateId}"]`);
    if (updateElement) {
        // Animacja znikania
        updateElement.style.transition = 'all 0.3s ease';
        updateElement.style.opacity = '0';
        updateElement.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            updateElement.remove();
        }, 300);
    }
    
    // Aktualizacja daty ostatniej modyfikacji
    updateLastModified();
}

// Funkcja do eksportu aktualizacji (przydatna do backupu)
function exportUpdates() {
    const updates = getUpdatesFromStorage();
    const dataStr = JSON.stringify(updates, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'family-updates-backup.json';
    link.click();
}

// Funkcja do importu aktualizacji
function importUpdates(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const updates = JSON.parse(e.target.result);
            localStorage.setItem('familyUpdates', JSON.stringify(updates));
            location.reload(); // Przeładuj stronę aby pokazać nowe dane
        } catch (error) {
            alert('Błąd podczas importu pliku. Sprawdź czy plik jest poprawny.');
        }
    };
    reader.readAsText(file);
}

// Czyszczenie wszystkich aktualizacji (z potwierdzeniem)
function clearAllUpdates() {
    if (confirm('Czy na pewno chcesz usunąć wszystkie aktualizacje? Ta operacja jest nieodwracalna.')) {
        localStorage.removeItem('familyUpdates');
        location.reload();
    }
}

// Funkcja do łatwego dodawania widgetu siepomaga.pl
function addSiepomagaWidget(widgetCode) {
    const widgetContainer = document.getElementById('siepomaga-widget');
    if (widgetContainer && widgetCode) {
        widgetContainer.innerHTML = widgetCode;
    }
}

// Przykład użycia dla widgetu siepomaga.pl (odkomentuj i dostosuj)
// Gdy otrzymasz kod widgetu z siepomaga.pl, użyj tej funkcji:
/*
document.addEventListener('DOMContentLoaded', function() {
    const siepomagaCode = `
        <!-- Tutaj wklej kod widgetu otrzymany z siepomaga.pl -->
    `;
    addSiepomagaWidget(siepomagaCode);
});
*/

// Funkcje pomocnicze dla konsoli deweloperskiej
window.familySupport = {
    exportUpdates: exportUpdates,
    clearAllUpdates: clearAllUpdates,
    addUpdate: function(text) {
        addNewUpdate(text);
    },
    getUpdates: getUpdatesFromStorage
};

// Prostej walidacji formularza
function validateForm() {
    const textarea = document.getElementById('update-text');
    const value = textarea.value.trim();
    
    if (value.length < 10) {
        alert('Aktualizacja powinna mieć co najmniej 10 znaków.');
        return false;
    }
    
    if (value.length > 5000) {
        alert('Aktualizacja jest zbyt długa (maksymalnie 5000 znaków).');
        return false;
    }
    
    return true;
}

// Dodaj walidację do formularza
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('update-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }
});

// Automatyczne zapisywanie draftu
let draftTimeout;
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('update-text');
    if (textarea) {
        textarea.addEventListener('input', function() {
            clearTimeout(draftTimeout);
            draftTimeout = setTimeout(() => {
                localStorage.setItem('updateDraft', textarea.value);
            }, 1000);
        });
        
        // Przywróć draft przy ładowaniu
        const draft = localStorage.getItem('updateDraft');
        if (draft) {
            textarea.value = draft;
        }
        
        // Wyczyść draft po wysłaniu
        const form = document.getElementById('update-form');
        if (form) {
            form.addEventListener('submit', function() {
                localStorage.removeItem('updateDraft');
            });
        }
    }
});

console.log('Strona wsparcia załadowana. Dostępne funkcje w konsoli: window.familySupport');

// Funkcja do obsługi mobilnego menu
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.toggle('mobile-active');
    toggle.classList.toggle('active');
}

// ===== UPROSZCZONA INTEGRACJA Z GOOGLE DRIVE =====

// Sprawdzenie hasła do dokumentacji
function checkDocPassword() {
    const passwordInput = document.getElementById('doc-password');
    const password = passwordInput.value.trim();
    const correctPassword = 'Anna123'; // To samo hasło co do admina
    
    if (password === correctPassword) {
        // Ukryj sekcję autoryzacji
        document.getElementById('auth-section').style.display = 'none';
        // Pokaż zawartość dokumentacji
        document.getElementById('documentation-content').style.display = 'block';
        // Załaduj zapisany folder Drive
        loadDriveConfig();
        // Zapisz stan logowania
        sessionStorage.setItem('docAuthenticated', 'true');
    } else {
        alert('Nieprawidłowe hasło!');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Obsługa Enter w polu hasła
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('doc-password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkDocPassword();
            }
        });
        
        // Sprawdź czy już jest zalogowany w tej sesji
        if (sessionStorage.getItem('docAuthenticated') === 'true') {
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('documentation-content').style.display = 'block';
            loadDriveConfig();
        }
    }
});

// Ustawienie folderu Google Drive
function setDriveFolder() {
    const urlInput = document.getElementById('drive-folder-url');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Proszę wprowadzić link do folderu.');
        return;
    }
    
    if (!url.includes('drive.google.com')) {
        alert('To nie wygląda na link do Google Drive.');
        return;
    }
    
    // Zapisz URL
    localStorage.setItem('driveFolder', url);
    
    // Pokaż viewer
    showDriveViewer(url);
    
    alert('Folder został zapisany!');
}

// Pokazanie viewera Google Drive
function showDriveViewer(url) {
    const viewerSection = document.getElementById('drive-viewer-section');
    const iframe = document.getElementById('drive-iframe');
    
    // Konwertuj URL na format embed
    let embedUrl = convertToEmbedUrl(url);
    
    if (embedUrl) {
        iframe.src = embedUrl;
        viewerSection.style.display = 'block';
        
        // Zapisz również embed URL
        localStorage.setItem('driveEmbedUrl', embedUrl);
    } else {
        alert('Nie udało się przetworzyć linku. Sprawdź czy folder jest publiczny.');
    }
}

// Konwersja URL na format embed
function convertToEmbedUrl(url) {
    try {
        // Różne formaty linków Google Drive
        if (url.includes('/folders/')) {
            // Format: https://drive.google.com/drive/folders/ID
            const folderId = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
            if (folderId) {
                return `https://drive.google.com/embeddedfolderview?id=${folderId[1]}#grid`;
            }
        }
        
        if (url.includes('?id=')) {
            // Format: https://drive.google.com/drive/folders?id=ID
            const folderId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (folderId) {
                return `https://drive.google.com/embeddedfolderview?id=${folderId[1]}#grid`;
            }
        }
        
        // Jeśli nic nie pasuje, spróbuj oryginalny URL
        return url;
        
    } catch (error) {
        console.error('Błąd podczas konwersji URL:', error);
        return null;
    }
}

// Ładowanie konfiguracji Drive
function loadDriveConfig() {
    // Domyślny folder - zawsze ten sam
    const defaultUrl = 'https://drive.google.com/drive/folders/1O3TvboZU8er6acag193LQyoWGbDjV1KN?usp=sharing';
    
    // Konwertuj na prawidłowy embed URL
    const embedUrl = `https://drive.google.com/embeddedfolderview?id=1O3TvboZU8er6acag193LQyoWGbDjV1KN#grid`;
    
    // Od razu pokaż viewer z tym folderem
    const viewerSection = document.getElementById('drive-viewer-section');
    const iframe = document.getElementById('drive-iframe');
    
    if (iframe && viewerSection) {
        iframe.src = embedUrl;
        viewerSection.style.display = 'block';
    }
}

// Odświeżenie Drive
function refreshDrive() {
    const iframe = document.getElementById('drive-iframe');
    const currentSrc = iframe.src;
    
    if (currentSrc) {
        // Wymuszenie ponownego załadowania
        iframe.src = '';
        setTimeout(() => {
            iframe.src = currentSrc;
        }, 100);
        
        // Pokaż loading
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Odświeżanie...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// Otworzenie w Google Drive
function openInDrive() {
    const folderUrl = 'https://drive.google.com/drive/folders/1O3TvboZU8er6acag193LQyoWGbDjV1KN?usp=sharing';
    window.open(folderUrl, '_blank');
}

// ===== TIMER HOSPITALIZACJI =====

// Inicjalizacja timera hospitalizacji
function initializeHospitalizationTimer() {
    // Sprawdź czy elementy timera istnieją na stronie
    const hospitalElement = document.getElementById('hospital-days');
    const icuElement = document.getElementById('icu-days');
    
    if (hospitalElement || icuElement) {
        updateHospitalizationTimer();
        // Aktualizuj co sekundę
        setInterval(updateHospitalizationTimer, 1000);
    }
}

// Aktualizacja timera hospitalizacji
function updateHospitalizationTimer() {
    const now = new Date();
    
    // Data rozpoczęcia hospitalizacji: 2 września 2025
    const hospitalStartDate = new Date('2025-09-02T00:00:00');
    
    // Data rozpoczęcia OIOM: 20 września 2025  
    const icuStartDate = new Date('2025-09-20T00:00:00');
    
    // Oblicz czas w szpitalu
    const hospitalTimeDiff = now - hospitalStartDate;
    const hospitalDays = Math.floor(hospitalTimeDiff / (1000 * 60 * 60 * 24));
    const hospitalHours = Math.floor((hospitalTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const hospitalMinutes = Math.floor((hospitalTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const hospitalSeconds = Math.floor((hospitalTimeDiff % (1000 * 60)) / 1000);
    
    // Oblicz czas na OIOM (tylko jeśli już się rozpoczął)
    let icuDays = 0, icuHours = 0, icuMinutes = 0, icuSeconds = 0;
    if (now >= icuStartDate) {
        const icuTimeDiff = now - icuStartDate;
        icuDays = Math.floor(icuTimeDiff / (1000 * 60 * 60 * 24));
        icuHours = Math.floor((icuTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        icuMinutes = Math.floor((icuTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
        icuSeconds = Math.floor((icuTimeDiff % (1000 * 60)) / 1000);
    }
    
    // Aktualizuj elementy szpitala
    updateTimerElement('hospital-days', hospitalDays.toString().padStart(2, '0'));
    updateTimerElement('hospital-hours', hospitalHours.toString().padStart(2, '0'));
    updateTimerElement('hospital-minutes', hospitalMinutes.toString().padStart(2, '0'));
    updateTimerElement('hospital-seconds', hospitalSeconds.toString().padStart(2, '0'));
    
    // Aktualizuj elementy OIOM
    updateTimerElement('icu-days', icuDays.toString().padStart(2, '0'));
    updateTimerElement('icu-hours', icuHours.toString().padStart(2, '0'));
    updateTimerElement('icu-minutes', icuMinutes.toString().padStart(2, '0'));
    updateTimerElement('icu-seconds', icuSeconds.toString().padStart(2, '0'));
}

// Pomocnicza funkcja do aktualizacji elementów timera
function updateTimerElement(id, value) {
    const element = document.getElementById(id);
    if (element && element.textContent !== value) {
        element.textContent = value;
        // Animacja przy zmianie
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
}