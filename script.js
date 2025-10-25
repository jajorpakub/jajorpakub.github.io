// Funkcjonalności strony wsparcia

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    updateLastModified();
    loadUpdatesFromStorage();
    initializeUpdateForm();
});

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
        adminSection.style.display = 'block';
        showButton.style.display = 'none';
    } else {
        adminSection.style.display = 'none';
        showButton.style.display = 'block';
    }
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
    const updateText = textarea.value.trim();
    
    if (updateText === '') {
        alert('Proszę wprowadzić treść aktualizacji.');
        return;
    }
    
    addNewUpdate(updateText);
    textarea.value = '';
    toggleAdmin();
}

// Dodawanie nowej aktualizacji
function addNewUpdate(text) {
    const updatesContainer = document.getElementById('updates-container');
    const now = new Date();
    const dateString = formatDate(now);
    
    // Tworzenie nowego elementu aktualizacji
    const updateElement = document.createElement('div');
    updateElement.className = 'update-item';
    updateElement.innerHTML = `
        <div class="update-date">${dateString}</div>
        <div class="update-content">
            <p>${formatUpdateText(text)}</p>
        </div>
    `;
    
    // Dodanie na początku listy
    const firstUpdate = updatesContainer.querySelector('.update-item');
    if (firstUpdate) {
        updatesContainer.insertBefore(updateElement, firstUpdate);
    } else {
        updatesContainer.appendChild(updateElement);
    }
    
    // Zapisanie do localStorage
    saveUpdateToStorage(text, now);
    
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
function saveUpdateToStorage(text, date) {
    let updates = getUpdatesFromStorage();
    updates.unshift({
        text: text,
        date: date.toISOString(),
        id: Date.now()
    });
    
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
    
    // Dodaj zapisane aktualizacje
    updates.forEach(update => {
        const date = new Date(update.date);
        const updateElement = document.createElement('div');
        updateElement.className = 'update-item';
        updateElement.innerHTML = `
            <div class="update-date">${formatDate(date)}</div>
            <div class="update-content">
                <p>${formatUpdateText(update.text)}</p>
            </div>
        `;
        updatesContainer.appendChild(updateElement);
    });
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