// Online Attendance Web App

// Global variables
let currentClass = '';
let currentSection = '';
let students = [];
let attendanceRecords = [];
let editingStudentId = null;

let leaveData = [];
let marksData = [];
let feeData = [];

const studentCategorySelect = document.getElementById('studentCategory');


// DOM Elements
const classSetupSection = document.getElementById('classSetup');
const mainAppSection = document.getElementById('mainApp');
const classInfo = document.getElementById('classInfo');
const currentClassSpan = document.getElementById('currentClass');
const changeClassBtn = document.getElementById('changeClassBtn');
const loadClassBtn = document.getElementById('loadClassBtn');
const classNameInput = document.getElementById('className');
const sectionNameInput = document.getElementById('sectionName');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const studentsList = document.getElementById('studentsList');
const addStudentBtn = document.getElementById('addStudentBtn');
const studentSearch = document.getElementById('studentSearch');
const rollSort = document.getElementById('rollSort');

const attendanceList = document.getElementById('attendanceList');
const attendanceDate = document.getElementById('attendanceDate');
const markAllPresentBtn = document.getElementById('markAllPresent');
const markAllAbsentBtn = document.getElementById('markAllAbsent');
const saveAttendanceBtn = document.getElementById('saveAttendance');

const historyList = document.getElementById('historyList');

const studentSelect = document.getElementById('studentSelect');
const reportMonth = document.getElementById('reportMonth');
const generateReportBtn = document.getElementById('generateReport');
const reportResults = document.getElementById('reportResults');

const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const studentRollInput = document.getElementById('studentRoll');
const studentImageInput = document.getElementById('studentImage');
const imagePreview = document.getElementById('imagePreview');
const cancelStudentBtn = document.getElementById('cancelStudentBtn');

const attendanceDetailModal = document.getElementById('attendanceDetailModal');
const attendanceDetailContent = document.getElementById('attendanceDetailContent');
const closeDetailBtn = document.getElementById('closeDetailBtn');

const exportStudentsCSVBtn = document.getElementById('exportStudentsCSV');
const exportAttendancePDFBtn = document.getElementById('exportAttendancePDF');
const exportReportPDFBtn = document.getElementById('exportReportPDF');

const loadSampleDataBtn = document.getElementById('loadSampleData');
const clearAllDataBtn = document.getElementById('clearAllData');

const toast = document.getElementById('toast');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set current date as default for attendance
    attendanceDate.value = getCurrentDate();
    
    // Set current month as default for reports
    reportMonth.value = getCurrentMonth();
    
    // Event listeners for class setup
    loadClassBtn.addEventListener('click', loadOrCreateClass);
    changeClassBtn.addEventListener('click', changeClass);
    
    // Event listeners for tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Event listeners for student management
    addStudentBtn.addEventListener('click', openAddStudentModal);
    studentSearch.addEventListener('input', filterStudents);
    rollSort.addEventListener('change', renderStudents);
    
    // Event listeners for attendance
    markAllPresentBtn.addEventListener('click', markAllPresent);
    markAllAbsentBtn.addEventListener('click', markAllAbsent);
    saveAttendanceBtn.addEventListener('click', saveAttendance);
    
    // Event listeners for reports
    generateReportBtn.addEventListener('click', generateStudentReport);
    
    // Event listeners for modals
    studentForm.addEventListener('submit', saveStudent);
    cancelStudentBtn.addEventListener('click', closeStudentModal);
    studentImageInput.addEventListener('change', previewImage);
    closeDetailBtn.addEventListener('click', closeAttendanceDetailModal);
    
    // Event listeners for export buttons
    exportStudentsCSVBtn.addEventListener('click', exportStudentsCSV);
    exportAttendancePDFBtn.addEventListener('click', exportAttendancePDF);
    exportReportPDFBtn.addEventListener('click', exportReportPDF);
    
    // Event listeners for sample data and clear data
    loadSampleDataBtn.addEventListener('click', loadSampleData);
    clearAllDataBtn.addEventListener('click', clearAllData);
    
    // Check if there's a previously loaded class
    const savedClass = localStorage.getItem('currentClass');
    const savedSection = localStorage.getItem('currentSection');
    
    if (savedClass && savedSection) {
        classNameInput.value = savedClass;
        sectionNameInput.value = savedSection;
        loadClassData(savedClass, savedSection);
    }
}

function loadLeaveData() {
    const key = `leave_${currentClass}_${currentSection}`;
    leaveData = JSON.parse(localStorage.getItem(key)) || [];
    renderLeaveList();
}

function saveLeaveData() {
    const key = `leave_${currentClass}_${currentSection}`;
    localStorage.setItem(key, JSON.stringify(leaveData));
}

function renderLeaveList() {
    const container = document.getElementById("leaveList");
    if (!container) return;
    
    container.innerHTML = "";
    const selectedDate = attendanceDate.value;

    students.forEach(st => {
        const leaveRecord = leaveData.find(l => l.roll === st.roll && l.date === selectedDate);
        const leaveStatus = leaveRecord ? leaveRecord.status : "Present";

        container.innerHTML += `
            <div class="leave-item">
                <span>${st.roll} - ${st.name}</span>
                <select onchange="updateLeave(${st.roll}, this.value)">
                    <option value="Present" ${leaveStatus==="Present"?"selected":""}>Present</option>
                    <option value="Absent" ${leaveStatus==="Absent"?"selected":""}>Absent</option>
                    <option value="Leave" ${leaveStatus==="Leave"?"selected":""}>Leave</option>
                </select>
            </div>
        `;
    });
}

function updateLeave(roll, value) {
    const selectedDate = attendanceDate.value; // Get the current attendance date
    
    // Find existing leave record for this roll and date
    const existingIndex = leaveData.findIndex(l => l.roll === roll && l.date === selectedDate);
    
    if (existingIndex !== -1) {
        if (value === "Present") {
            // Remove leave record if status is changed to Present
            leaveData.splice(existingIndex, 1);
        } else {
            // Update existing record
            leaveData[existingIndex].status = value;
        }
    } else if (value !== "Present") {
        // Add new leave record only if status is not Present
        leaveData.push({ 
            roll, 
            status: value, 
            date: selectedDate 
        });
    }

    saveLeaveData();
    renderLeaveList();
}


function loadMarksData() {
    const key = `marks_${currentClass}_${currentSection}`;
    marksData = JSON.parse(localStorage.getItem(key)) || [];
    renderMarksList();
}

function saveMarksData() {
    const key = `marks_${currentClass}_${currentSection}`;
    localStorage.setItem(key, JSON.stringify(marksData));
}

document.getElementById("saveMarksBtn").addEventListener("click", () => {
    const roll = document.getElementById("marksStudentSelect").value;
    const exam = document.getElementById("examType").value;
    const marks = document.getElementById("examMarks").value;

    marksData.push({ roll, exam, marks });
    saveMarksData();
    renderMarksList();
});

function renderMarksList() {
    const div = document.getElementById("marksList");
    div.innerHTML = "";

    marksData.forEach((m, index) => {
        div.innerHTML += `
            <div class="marks-item">
                <span>Roll: ${m.roll} | Exam: ${m.exam} | Marks: ${m.marks}</span>
                <button class="delete-btn" onclick="deleteMarks(${index})">Delete</button>
            </div>
        `;
    });
}

function deleteMarks(i) {
    marksData.splice(i, 1);
    saveMarksData();
    renderMarksList();
}


function loadFeeData() {
    const key = `fee_${currentClass}_${currentSection}`;
    feeData = JSON.parse(localStorage.getItem(key)) || [];
    renderFeeList();
}

function saveFeeData() {
    const key = `fee_${currentClass}_${currentSection}`;
    localStorage.setItem(key, JSON.stringify(feeData));
}
document.getElementById("saveFeeBtn").addEventListener("click", () => {
    const roll = document.getElementById("feeStudentSelect").value;
    const status = document.getElementById("feeStatus").value;
    const amount = document.getElementById("feeAmount").value;
    const feeDuration = document.getElementById("feeDuration").value;

    feeData.push({ roll, status, amount, feeDuration });
    saveFeeData();
    renderFeeList();
    
    // Reset fields
    document.getElementById("feeAmount").value = "";
    document.getElementById("feeDuration").value = "1-month";
});

function renderFeeList() {
    const div = document.getElementById("feeList");
    div.innerHTML = "";

    feeData.forEach((f, i) => {
        div.innerHTML += `
            <div class="fee-item marks-item">
                <span>Roll: ${f.roll} | Status: ${f.status} | Amount: ${f.amount} | Duration: ${f.feeDuration}</span>
                <button class="delete-btn" onclick="deleteFee(${i})">Delete</button>
            </div>
        `;
    });
}

function deleteFee(i) {
    feeData.splice(i, 1);
    saveFeeData();
    renderFeeList();
}


function fillStudentDropdowns() {
    const selects = [
        document.getElementById("marksStudentSelect"),
        document.getElementById("feeStudentSelect"),
        document.getElementById("studentSelect") // Add this for reports tab
    ];

    selects.forEach(sel => {
        if (sel) { // Check if element exists
            sel.innerHTML = "";
            students.forEach(st => {
                sel.innerHTML += `<option value="${st.roll}">${st.roll} - ${st.name}</option>`;
            });
        }
    });
}


/**
 * Load or create a class based on user input
 */
function loadOrCreateClass() {
    const className = classNameInput.value.trim();
    const sectionName = sectionNameInput.value.trim();
    
    if (!className || !sectionName) {
        showToast('Please enter both class and section names', 'error');
        return;
    }
    
    loadClassData(className, sectionName);
}

/**
 * Load class data from localStorage
 * @param {string} className - The class name
 * @param {string} sectionName - The section name
 */
function loadClassData(className, sectionName) {
    currentClass = className;
    currentSection = sectionName;
    
    // Save current class for next session
    localStorage.setItem('currentClass', className);
    localStorage.setItem('currentSection', sectionName);
    
    // Update UI
    currentClassSpan.textContent = `${className} - Section ${sectionName}`;
    classSetupSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    
    // Load data from localStorage
    loadStudents();
    loadAttendanceRecords();
    loadLeaveData();
    loadMarksData();
    loadFeeData();
    
    // Render initial views
    renderStudents();
    renderAttendance();
    renderAttendanceHistory();
    fillStudentDropdowns();
    populateStudentSelect();
    
    showToast(`Class ${className} - Section ${sectionName} loaded successfully`, 'success');
}

/**
 * Change the current class
 */
function changeClass() {
    currentClass = '';
    currentSection = '';
    
    // Clear saved class
    localStorage.removeItem('currentClass');
    localStorage.removeItem('currentSection');
    
    // Reset in-memory data
    students = [];
    attendanceRecords = [];
    leaveData = [];
    marksData = [];
    feeData = [];
    
    // Reset UI
    classSetupSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
    classNameInput.value = '';
    sectionNameInput.value = '';
    classNameInput.focus();
}

/**
 * Switch between tabs
 * @param {string} tabName - The name of the tab to switch to
 */
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab contents
    tabContents.forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
            
            // Refresh content if needed
            if (tabName === 'attendance') {
                renderAttendance();
            } else if (tabName === 'history') {
                renderAttendanceHistory();
            }
        } else {
            content.classList.remove('active');
        }
    });
}

/**
 * Load students from localStorage
 */
function loadStudents() {
    const key = `students_${currentClass}_${currentSection}`;
    const storedStudents = localStorage.getItem(key);
    students = storedStudents ? JSON.parse(storedStudents) : [];
    
    // Sort students by roll number
    sortStudents();
}

/**
 * Save students to localStorage
 */
function saveStudents() {
    const key = `students_${currentClass}_${currentSection}`;
    localStorage.setItem(key, JSON.stringify(students));
}

/**
 * Sort students by roll number (numeric)
 */
function sortStudents() {
    students.sort((a, b) => {
        // Convert roll numbers to integers for proper numeric sorting
        return parseInt(a.roll) - parseInt(b.roll);
    });
}

/**
 * Load attendance records from localStorage
 */
function loadAttendanceRecords() {
    const key = `attendance_${currentClass}_${currentSection}`;
    const storedRecords = localStorage.getItem(key);
    attendanceRecords = storedRecords ? JSON.parse(storedRecords) : [];
}

/**
 * Save attendance records to localStorage
 */
function saveAttendanceRecords() {
    const key = `attendance_${currentClass}_${currentSection}`;
    localStorage.setItem(key, JSON.stringify(attendanceRecords));
}

/**
 * Render the students list
 */
function renderStudents() {
    if (students.length === 0) {
        studentsList.innerHTML = '<p class="text-center">No students added yet. Click "Add Student" to get started.</p>';
        return;
    }
    
    let filteredStudents = [...students];
    
    // Apply search filter if any
    const searchTerm = studentSearch.value.toLowerCase();
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm) || 
            student.roll.toString().includes(searchTerm)
        );
    }
    
    // Apply roll number sorting
    const sortOrder = rollSort.value;
    if (sortOrder === 'desc') {
        filteredStudents.sort((a, b) => parseInt(b.roll) - parseInt(a.roll));
    } else {
        filteredStudents.sort((a, b) => parseInt(a.roll) - parseInt(b.roll));
    }
    
    // Generate HTML for students list
    studentsList.innerHTML = filteredStudents.map(student => `
        <div class="student-card">
            <div class="student-image">
                ${student.image ? 
                    `<img src="${student.image}" alt="${student.name}" class="student-image">` : 
                    '<i class="fas fa-user"></i>'
                }
            </div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-roll">Roll No: ${student.roll}</div>
                <div class="student-category">Category: ${student.category || 'General'}</div> <!-- NEW LINE -->

            </div>
            <div class="student-actions">
                <button class="action-btn edit" onclick="editStudent('${student.id}')">
                ✏️
                </button>
                <button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                🗑️
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Filter students based on search input
 */
function filterStudents() {
    renderStudents();
}

/**
 * Open the add student modal
 */
function openAddStudentModal() {
    editingStudentId = null;
    modalTitle.textContent = 'Add Student';
    studentForm.reset();
    studentCategorySelect.value = 'General'; // NEW LINE - DEFAULT SET
    imagePreview.innerHTML = '';
    studentModal.classList.remove('hidden');
}

/**
 * Open the edit student modal
 * @param {string} studentId - The ID of the student to edit
 */
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    editingStudentId = studentId;
    modalTitle.textContent = 'Edit Student';
    studentNameInput.value = student.name;
    studentRollInput.value = student.roll;
    studentCategorySelect.value = student.category || 'General'; // NEW LINE
    
    if (student.image) {
        imagePreview.innerHTML = `<img src="${student.image}" alt="Preview">`;
    } else {
        imagePreview.innerHTML = '';
    }
    
    studentModal.classList.remove('hidden');
}

/**
 * Close the student modal
 */
function closeStudentModal() {
    studentModal.classList.add('hidden');
    editingStudentId = null;
}

/**
 * Preview the selected image
 */
function previewImage() {
    const file = studentImageInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

/**
 * Save student (add or edit)
 * @param {Event} e - The form submit event
 */
function saveStudent(e) {
    e.preventDefault();
    
    const name = studentNameInput.value.trim();
    const roll = parseInt(studentRollInput.value);
    const category = studentCategorySelect.value; // NEW LINE

    
   if (!name || !roll || !category) { // MODIFIED CONDITION
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if roll number already exists (for new students or when changing roll number)
    if (students.some(s => s.roll === roll && s.id !== editingStudentId)) {
        showToast('A student with this roll number already exists', 'error');
        return;
    }
    
    // Handle image upload
    let imageBase64 = '';
    const file = studentImageInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageBase64 = e.target.result;
            completeStudentSave(name, roll, category, imageBase64); // MODIFIED
        };
        reader.readAsDataURL(file);
    } else {
        // If no new image, keep the existing one when editing
        if (editingStudentId) {
            const existingStudent = students.find(s => s.id === editingStudentId);
            imageBase64 = existingStudent ? existingStudent.image : '';
        }
        completeStudentSave(name, roll, category, imageBase64); // MODIFIED
    }
}

/**
 * Complete the student save operation after image processing
 * @param {string} name - Student name
 * @param {number} roll - Student roll number
 * @param {string} imageBase64 - Student image as base64 string
 */
function completeStudentSave(name, roll, category, imageBase64) {
    if (editingStudentId) {
        // Update existing student
        const studentIndex = students.findIndex(s => s.id === editingStudentId);
        if (studentIndex !== -1) {
            students[studentIndex] = {
                ...students[studentIndex],
                name,
                roll,
                category, // NEW LINE
                image: imageBase64
            };
        }
        showToast('Student updated successfully', 'success');
    } else {
        // Add new student
        const newStudent = {
            id: generateId(),
            name,
            roll,
            category, // NEW LINE
            image: imageBase64
        };
        students.push(newStudent);
        showToast('Student added successfully', 'success');
    }
    
    // Sort and save students
    sortStudents();
    saveStudents();
    
    // Update UI
    renderStudents();
    renderAttendance();        
    renderAttendanceHistory();
    populateStudentSelect();
    
    fillStudentDropdowns();        // ← Marks, Fee, Reports dropdown update
    populateStudentSelect();       // ← Report wala student select update
    
    // Close modal
    closeStudentModal();
}

/**
 * Delete a student
 * @param {string} studentId - The ID of the student to delete
 */
function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }
    
    // Remove student from students array
    students = students.filter(s => s.id !== studentId);
    
    // Remove student from all attendance records
    attendanceRecords.forEach(record => {
        record.students = record.students.filter(s => s.roll !== parseInt(students.find(s => s.id === studentId)?.roll));
    });
    
    // Save changes
    saveStudents();
    saveAttendanceRecords();
    
    // YE 4 LINES ADD KAR DE
renderAttendance();           // Mark Attendance list update ho jayegi
renderAttendanceHistory();    // History bhi update
fillStudentDropdowns();
populateStudentSelect();
    
    // Update UI
    renderStudents();
    populateStudentSelect();
    
    fillStudentDropdowns();
    populateStudentSelect();
    
    showToast('Student deleted successfully', 'success');
}

/**
 * Populate the student select dropdown for reports
 */
function populateStudentSelect() {
    studentSelect.innerHTML = `
        <option value="">Select a student</option>
        <option value="all">Select All - All Students Report</option>
    `;
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (Roll: ${student.roll})`;
        studentSelect.appendChild(option);
    });
}

/**
 * Render the attendance marking interface
 */
function renderAttendance() {
    if (students.length === 0) {
        attendanceList.innerHTML = '<p class="text-center">No students added yet. Add students first to mark attendance.</p>';
        return;
    }
    
    // Check if attendance already exists for the selected date
    const selectedDate = attendanceDate.value;
    const existingRecord = attendanceRecords.find(record => record.date === selectedDate);
    
    let attendanceStatus = {};
    if (existingRecord) {
        // Load existing attendance status
        existingRecord.students.forEach(student => {
            attendanceStatus[student.roll] = student.status;
        });
    }
    
    // Generate HTML for attendance list
    attendanceList.innerHTML = students.map(student => {
        const status = attendanceStatus[student.roll] || 'Absent';
        const isPresent = status === 'Present';
        
        return `
            <div class="attendance-card">
                <div class="student-image">
                    ${student.image ? 
                        `<img src="${student.image}" alt="${student.name}" class="student-image">` : 
                        '<i class="fas fa-user"></i>'
                    }
                </div>
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-roll">Roll No: ${student.roll}</div>
                </div>
                <div class="attendance-toggle ${isPresent ? 'present' : ''}" 
                     data-roll="${student.roll}" 
                     onclick="toggleAttendance(this)">
                </div>
            </div>
        `;
    }).join('');
    
    // Update save button text if attendance already exists
    if (existingRecord) {
        saveAttendanceBtn.textContent = 'Update Attendance';
    } else {
        saveAttendanceBtn.textContent = 'Save Attendance';
    }
}

/**
 * Toggle attendance status for a student
 * @param {Element} element - The toggle element that was clicked
 */
function toggleAttendance(element) {
    element.classList.toggle('present');
}

/**
 * Mark all students as present
 */
function markAllPresent() {
    const toggles = document.querySelectorAll('.attendance-toggle');
    toggles.forEach(toggle => {
        toggle.classList.add('present');
    });
}

/**
 * Mark all students as absent
 */
function markAllAbsent() {
    const toggles = document.querySelectorAll('.attendance-toggle');
    toggles.forEach(toggle => {
        toggle.classList.remove('present');
    });
}

/**
 * Save attendance for the selected date
 */
function saveAttendance() {
    if (students.length === 0) {
        showToast('No students to mark attendance for', 'error');
        return;
    }
    
    const selectedDate = attendanceDate.value;
    if (!selectedDate) {
        showToast('Please select a date', 'error');
        return;
    }
    
    // Get attendance status for all students
    const attendanceData = [];
    const toggles = document.querySelectorAll('.attendance-toggle');
    
    toggles.forEach(toggle => {
        const roll = parseInt(toggle.dataset.roll);
        const student = students.find(s => s.roll === roll);
        
        // Check if student is on leave for this date
        const leaveRecord = leaveData.find(l => l.roll === roll && l.date === selectedDate);
        const status = leaveRecord ? leaveRecord.status : 
                      (toggle.classList.contains('present') ? 'Present' : 'Absent');
        
        if (student) {
            attendanceData.push({
                roll: student.roll,
                name: student.name,
                status: status
            });
        }
    });
    
    // Rest of the function remains the same...
    // Check if attendance already exists for this date
    const existingRecordIndex = attendanceRecords.findIndex(record => record.date === selectedDate);
    
    if (existingRecordIndex !== -1) {
        // Update existing record
        if (confirm('Attendance for this date already exists. Do you want to overwrite it?')) {
            attendanceRecords[existingRecordIndex].students = attendanceData;
            showToast('Attendance updated successfully', 'success');
        } else {
            return;
        }
    } else {
        // Add new record
        attendanceRecords.push({
            date: selectedDate,
            students: attendanceData
        });
        showToast('Attendance saved successfully', 'success');
    }
    
    // Save to localStorage and refresh history
    saveAttendanceRecords();
    renderAttendanceHistory();
}

/**
 * Render attendance history
 */
function renderAttendanceHistory() {
    if (attendanceRecords.length === 0) {
        historyList.innerHTML = '<p class="text-center">No attendance records yet.</p>';
        return;
    }
    
    // Sort records by date (newest first)
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Generate HTML for history list
    historyList.innerHTML = sortedRecords.map(record => {
        const presentCount = record.students.filter(s => s.status === 'Present').length;
        const absentCount = record.students.length - presentCount;
        const percentage = record.students.length > 0 ? 
            Math.round((presentCount / record.students.length) * 100) : 0;
        
        return `
            <div class="history-item">
                <div class="history-date">${formatDate(record.date)}</div>
                <div class="history-stats">
                    <div class="stat present-stat">
                        <div class="stat-value">${presentCount}</div>
                        <div class="stat-label">Present</div>
                    </div>
                    <div class="stat absent-stat">
                        <div class="stat-value">${absentCount}</div>
                        <div class="stat-label">Absent</div>
                    </div>
                    <div class="stat percentage-stat">
                        <div class="stat-value">${percentage}%</div>
                        <div class="stat-label">Present</div>
                    </div>
                </div>
                <button class="btn-secondary" onclick="viewAttendanceDetails('${record.date}')">
                    View Details
                </button>
            </div>
        `;
    }).join('');
}

/**
 * View detailed attendance for a specific date
 * @param {string} date - The date to view details for
 */
function viewAttendanceDetails(date) {
    const record = attendanceRecords.find(r => r.date === date);
    if (!record) return;
    
    const presentCount = record.students.filter(s => s.status === 'Present').length;
    const absentCount = record.students.length - presentCount;
    const percentage = record.students.length > 0 ? 
        Math.round((presentCount / record.students.length) * 100) : 0;
    
    // Generate HTML for details
    let detailsHTML = `
        <h3>Attendance for ${formatDate(date)}</h3>
        <div class="history-stats mb-20">
            <div class="stat present-stat">
                <div class="stat-value">${presentCount}</div>
                <div class="stat-label">Present</div>
            </div>
            <div class="stat absent-stat">
                <div class="stat-value">${absentCount}</div>
                <div class="stat-label">Absent</div>
            </div>
            <div class="stat percentage-stat">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">Present</div>
            </div>
        </div>
        <h4>Student Details:</h4>
        <div class="attendance-details-list">
    `;
    
    record.students.forEach(student => {
        const statusClass = student.status === 'Present' ? 'present' : 'absent';
        detailsHTML += `
            <div class="attendance-detail-item ${statusClass}">
                <span class="detail-name">${student.name}</span>
                <span class="detail-roll">Roll: ${student.roll}</span>
                <span class="detail-status">${student.status}</span>
            </div>
        `;
    });
    
    detailsHTML += '</div>';
    attendanceDetailContent.innerHTML = detailsHTML;
    attendanceDetailModal.classList.remove('hidden');
}

/**
 * Close the attendance details modal
 */
function closeAttendanceDetailModal() {
    attendanceDetailModal.classList.add('hidden');
}

/**
 * Generate report for all students
 * @param {string} month - The month in YYYY-MM format
 */
function generateAllStudentsReport(month) {
    if (students.length === 0) {
        showToast('No students found to generate report', 'error');
        return;
    }
    
    // Parse the selected month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    // Filter attendance records for the selected month
    const monthRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Generate HTML for all students report
    let reportHTML = `
        <div class="report-header">
            <h3>Attendance Report - All Students</h3>
            <div>Month: ${formatMonth(month)} | Class: ${currentClass} - Section ${currentSection}</div>
            <div>Total Students: ${students.length} | Total Records: ${monthRecords.length} days</div>
        </div>
        
        <div class="all-students-report">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Leave</th>
                        <th>Total Days</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Calculate statistics for each student
    students.forEach(student => {
        let presentCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        
        monthRecords.forEach(record => {
            const studentRecord = record.students.find(s => s.roll === student.roll);
            if (studentRecord) {
                if (studentRecord.status === 'Present') {
                    presentCount++;
                } else if (studentRecord.status === 'Leave') {
                    leaveCount++;
                } else {
                    absentCount++;
                }
            } else {
                // Check if student was on leave for this date
                const leaveRecord = leaveData.find(l => l.roll === student.roll && l.date === record.date);
                if (leaveRecord && leaveRecord.status === 'Leave') {
                    leaveCount++;
                } else {
                    absentCount++;
                }
            }
        });
        
        const totalDays = presentCount + absentCount + leaveCount;
        const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
        
        // Determine status based on percentage
        let status = 'Poor';
        let statusClass = 'poor';
        if (percentage >= 90) {
            status = 'Excellent';
            statusClass = 'excellent';
        } else if (percentage >= 75) {
            status = 'Good';
            statusClass = 'good';
        } else if (percentage >= 60) {
            status = 'Average';
            statusClass = 'average';
        }
        
        reportHTML += `
            <tr>
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>${presentCount}</td>
                <td>${absentCount}</td>
                <td>${leaveCount}</td>
                <td>${totalDays}</td>
                <td>
                    <div class="percentage-display">
                        <span>${percentage}%</span>
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="report-summary">
            <h4>Class Summary</h4>
            <div class="summary-stats">
    `;
    
    // Calculate class summary
    const totalPresent = students.reduce((sum, student) => {
        const studentPresent = monthRecords.reduce((studentSum, record) => {
            const studentRecord = record.students.find(s => s.roll === student.roll);
            return studentSum + (studentRecord && studentRecord.status === 'Present' ? 1 : 0);
        }, 0);
        return sum + studentPresent;
    }, 0);
    
    const totalPossibleDays = students.length * monthRecords.length;
    const classPercentage = totalPossibleDays > 0 ? Math.round((totalPresent / totalPossibleDays) * 100) : 0;
    
    reportHTML += `
                <div class="summary-stat">
                    <div class="summary-value">${students.length}</div>
                    <div class="summary-label">Total Students</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-value">${monthRecords.length}</div>
                    <div class="summary-label">Records Days</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-value">${classPercentage}%</div>
                    <div class="summary-label">Class Average</div>
                </div>
            </div>
        </div>
    `;
    
    reportResults.innerHTML = reportHTML;
}

/**
 * Generate a student report for the selected month
 */
function generateStudentReport() {
  
  // FIX: Sort records by date
    attendanceRecords = attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const studentId = studentSelect.value;
    const month = reportMonth.value;
    
    if (!studentId || !month) {
        showToast('Please select both a student and a month', 'error');
        return;
    }
    
    // Handle "Select All" option
    if (studentId === 'all') {
        generateAllStudentsReport(month);
        return;
    }
    
    // Original single student report code
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }
    
    // Parse the selected month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    
    // Filter attendance records for the selected month
    const monthRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Calculate attendance statistics
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    
    monthRecords.forEach(record => {
        const studentRecord = record.students.find(s => s.roll === student.roll);
        if (studentRecord) {
            if (studentRecord.status === 'Present') {
                presentCount++;
            } else if (studentRecord.status === 'Leave') {
                leaveCount++;
            } else {
                absentCount++;
            }
        } else {
            // Check if student was on leave for this date
            const leaveRecord = leaveData.find(l => l.roll === student.roll && l.date === record.date);
            if (leaveRecord && leaveRecord.status === 'Leave') {
                leaveCount++;
            } else {
                // If student not found in record and not on leave, count as absent
                absentCount++;
            }
        }
    });
    
    const totalDays = presentCount + absentCount + leaveCount;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
    
    // Generate HTML for report
    let reportHTML = `
        <div class="report-header">
            <h3>Attendance Report for ${student.name}</h3>
            <div>Month: ${formatMonth(month)} | Roll No: ${student.roll}</div>
        </div>
        
        <div class="report-stats">
            <div class="report-stat present">
                <div class="stat-number">${presentCount}</div>
                <div class="stat-description">Days Present</div>
            </div>
            <div class="report-stat absent">
                <div class="stat-number">${absentCount}</div>
                <div class="stat-description">Days Absent</div>
            </div>
            <div class="report-stat leave">
                <div class="stat-number">${leaveCount}</div>
                <div class="stat-description">Days on Leave</div>
            </div>
            <div class="report-stat percentage">
                <div class="stat-number">${percentage}%</div>
                <div class="stat-description">Attendance Rate</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        </div>
        
        <h4>Daily Attendance:</h4>
        <div class="daily-attendance">
    `;
    
    if (monthRecords.length === 0) {
        reportHTML += '<p>No attendance records found for this month.</p>';
    } else {
        monthRecords.forEach(record => {
            const studentRecord = record.students.find(s => s.roll === student.roll);
            let status = studentRecord ? studentRecord.status : 'Absent';
            
            // Override status with leave data if student was on leave
            const leaveRecord = leaveData.find(l => l.roll === student.roll && l.date === record.date);
            if (leaveRecord && leaveRecord.status === 'Leave') {
                status = 'Leave';
            }
            
            const statusClass = status.toLowerCase();
            
            reportHTML += `
                <div class="daily-record ${statusClass}">
                    <span class="record-date">${formatDate(record.date)}</span>
                    <span class="record-status">${status}</span>
                </div>
            `;
        });
    }
    
    reportHTML += '</div>';
    reportResults.innerHTML = reportHTML;
}

/**
 * Export students list as CSV
 */
function exportStudentsCSV() {
    if (students.length === 0) {
        showToast('No students to export', 'error');
        return;
    }
    
   // CSV HEADER MEIN CATEGORY ADD KARO:
let csvContent = 'Roll No,Name,Category\n';

// STUDENT DATA MEIN CATEGORY ADD KARO:
students.forEach(student => {
    csvContent += `${student.roll},${student.name},${student.category || 'General'}\n`;
});
    
    // Add student data
    students.forEach(student => {
        csvContent += `${student.roll},${student.name}\n`;
    });
    
    // Create and download the file
    downloadCSV(csvContent, `students_${currentClass}_${currentSection}.csv`);
    showToast('Students exported as CSV successfully', 'success');
}

/**
 * Export current attendance as PDF
 */
function exportAttendancePDF() {
    if (students.length === 0) {
        showToast('No students to export', 'error');
        return;
    }
    
    const selectedDate = attendanceDate.value;
    const existingRecord = attendanceRecords.find(record => record.date === selectedDate);
    
    if (!existingRecord) {
        showToast('No attendance recorded for the selected date', 'error');
        return;
    }
    
    // Use jsPDF to create PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Attendance Report - ${formatDate(selectedDate)}`, 20, 20);
    
    // Add class info
    doc.setFontSize(12);
    doc.text(`Class: ${currentClass} - Section: ${currentSection}`, 20, 35);
    
    // Calculate statistics
    const presentCount = existingRecord.students.filter(s => s.status === 'Present').length;
    const absentCount = existingRecord.students.length - presentCount;
    const percentage = existingRecord.students.length > 0 ? 
        Math.round((presentCount / existingRecord.students.length) * 100) : 0;
    
    // Add statistics
    doc.text(`Present: ${presentCount} | Absent: ${absentCount} | Percentage: ${percentage}%`, 20, 45);
    
    // Create table data
    const tableData = existingRecord.students.map(student => [
        student.roll.toString(),
        student.name,
        student.status
    ]);
    
    // Add table
    doc.autoTable({
        startY: 55,
        head: [['Roll No', 'Name', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 100 },
            2: { cellWidth: 40 }
        }
    });
    
    // Save the PDF
    doc.save(`attendance_${currentClass}_${currentSection}_${selectedDate}.pdf`);
    showToast('Attendance exported as PDF successfully', 'success');
}

/**
 * Export student report as PDF
 */
function exportReportPDF() {
    const studentId = studentSelect.value;
    const month = reportMonth.value;
    
    if (!studentId || !month) {
        showToast('Please generate a report first', 'error');
        return;
    }
    
    // Handle "Select All" export
    if (studentId === 'all') {
        exportAllStudentsReportPDF(month);
        return;
    }
    
    // Original single student export code...
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }
    
    // Rest of the original export code...
}

/**
 * Export all students report as PDF
 */
function exportAllStudentsReportPDF(month) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`All Students Attendance Report`, 20, 20);
    
    // Add class and month info
    doc.setFontSize(12);
    doc.text(`Class: ${currentClass} - Section: ${currentSection}`, 20, 35);
    doc.text(`Month: ${formatMonth(month)}`, 20, 45);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Parse the selected month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    // Filter attendance records for the selected month
    const monthRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Create table data
    const tableData = students.map(student => {
        let presentCount = 0;
        let absentCount = 0;
        let leaveCount = 0;
        
        monthRecords.forEach(record => {
            const studentRecord = record.students.find(s => s.roll === student.roll);
            if (studentRecord) {
                if (studentRecord.status === 'Present') {
                    presentCount++;
                } else if (studentRecord.status === 'Leave') {
                    leaveCount++;
                } else {
                    absentCount++;
                }
            } else {
                const leaveRecord = leaveData.find(l => l.roll === student.roll && l.date === record.date);
                if (leaveRecord && leaveRecord.status === 'Leave') {
                    leaveCount++;
                } else {
                    absentCount++;
                }
            }
        });
        
        const totalDays = presentCount + absentCount + leaveCount;
        const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
        
        return [
            student.roll.toString(),
            student.name,
            presentCount.toString(),
            absentCount.toString(),
            leaveCount.toString(),
            totalDays.toString(),
            `${percentage}%`
        ];
    });
    
    // Add table
    doc.autoTable({
        startY: 65,
        head: [['Roll No', 'Name', 'Present', 'Absent', 'Leave', 'Total', 'Attendance %']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 50 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 25 }
        }
    });
    
    // Save the PDF
    doc.save(`all_students_report_${currentClass}_${currentSection}_${month}.pdf`);
    showToast('All students report exported as PDF successfully', 'success');
}

/**
 * Load sample data for testing
 */
function loadSampleData() {
    if (students.length > 0 && !confirm('This will replace existing students and attendance records. Continue?')) {
        return;
    }
    
    // Sample students
    const sampleStudents = [
        { id: generateId(), name: 'Amit Sharma', roll: 1, image: '' },
        { id: generateId(), name: 'Priya Patel', roll: 2, image: '' },
        { id: generateId(), name: 'Rahul Kumar', roll: 3, image: '' },
        { id: generateId(), name: 'Sneha Singh', roll: 4, image: '' },
        { id: generateId(), name: 'Vikram Joshi', roll: 5, image: '' }
    ];
    
    // Sample attendance records (last 30 days)
    const sampleAttendance = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const studentsAttendance = sampleStudents.map(student => {
            // Randomly assign attendance (80% present)
            const status = Math.random() > 0.2 ? 'Present' : 'Absent';
            return {
                roll: student.roll,
                name: student.name,
                status: status
            };
        });
        
        sampleAttendance.push({
            date: dateStr,
            students: studentsAttendance
        });
    }
    
    // Save sample data
    students = sampleStudents;
    attendanceRecords = sampleAttendance;
    
    saveStudents();
    saveAttendanceRecords();
    
    // Update UI
    renderStudents();
    renderAttendance();
    renderAttendanceHistory();
    populateStudentSelect();
    
    showToast('Sample data loaded successfully', 'success');
}

/**
 * Clear all data for the current class
 */
function clearAllData() {
    if (!confirm('This will permanently delete all students and attendance records for this class. This action cannot be undone. Continue?')) {
        return;
    }
    
    // Clear data from localStorage
    const studentsKey = `students_${currentClass}_${currentSection}`;
    const attendanceKey = `attendance_${currentClass}_${currentSection}`;
    const leaveKey = `leave_${currentClass}_${currentSection}`;
    const marksKey = `marks_${currentClass}_${currentSection}`;
    const feeKey = `fee_${currentClass}_${currentSection}`;
    
    localStorage.removeItem(studentsKey);
    localStorage.removeItem(attendanceKey);
    localStorage.removeItem(leaveKey);
    localStorage.removeItem(marksKey);
    localStorage.removeItem(feeKey);
    
    // Reset in-memory data
    students = [];
    attendanceRecords = [];
    leaveData = [];
    marksData = [];
    feeData = [];
    
    // Update UI
    renderStudents();
    renderAttendance();
    renderAttendanceHistory();
    renderLeaveList(); // Add this
    renderMarksList(); // Add this
    renderFeeList();   // Add this
    populateStudentSelect();
    
    showToast('All data cleared for this class', 'success');
}

/**
 * Download CSV content as a file
 * @param {string} content - The CSV content
 * @param {string} filename - The filename for the download
 */
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get the current date in YYYY-MM-DD format
 * @returns {string} The current date
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get the current month in YYYY-MM format
 * @returns {string} The current month
 */
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format a date string to a more readable format
 * @param {string} dateStr - The date string in YYYY-MM-DD format
 * @returns {string} The formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format a month string to a more readable format
 * @param {string} monthStr - The month string in YYYY-MM format
 * @returns {string} The formatted month
 */
function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// --- Create style element first ---
const style = document.createElement('style');
style.textContent = ""; // initialize
document.head.appendChild(style);

// --- Add the extra CSS blocks AFTER style is created ---

// Add CSS for leave records
const additionalStyle = `
   /* Leave Item Card */
.leave-item {
    background: #ffffff;
    padding: 14px 18px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid #f1c40f; /* Yellow accent for Leave */
    box-shadow: 0px 4px 10px rgba(0,0,0,0.07);
    font-size: 15px;
    color: #2c3e50;
    margin-bottom: 12px;
    transition: 0.25s ease;
}

.leave-item:hover {
    transform: translateY(-3px);
    box-shadow: 0px 6px 15px rgba(0,0,0,0.12);
}

/* Student text */
.leave-item span {
    font-weight: 600;
    font-size: 15px;
}

/* Dropdown Select */
.leave-item select {
    padding: 7px 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f8f9fa;
    font-size: 14px;
    cursor: pointer;
    transition: 0.25s ease;
    outline: none;
}

/* Hover effect */
.leave-item select:hover {
    background: #eef2f3;
}

/* Focus effect */
.leave-item select:focus {
    border-color: #3498db;
    box-shadow: 0px 0px 5px rgba(52,152,219,0.5);
}

`;
style.textContent += additionalStyle;

// Add CSS for all students report
const allStudentsReportStyle = `
/* Main container */
#marksList {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
}

/* Each marks row */
.marks-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 14px 18px;
    border-radius: var(--border-radius);
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
    transition: 0.25s ease;
    position: relative;
    overflow: hidden;
}

/* Left colored accent */
.marks-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 5px;
    background: var(--gradient-primary);
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
}

/* Data text */
.marks-item span {
    font-weight: 600;
    color: var(--dark-color);
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Icons for clarity */
.marks-item span::before {
    content: "📘";
    font-size: 18px;
}

/* Hover animation */
.marks-item:hover {
    transform: scale(1.015);
    box-shadow: 0 6px 15px rgba(0,0,0,0.12);
}

/* Delete button */
.delete-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.25s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

/* Delete button icon */
.delete-btn::before {
    content: "🗑️";
    font-size: 14px;
}

/* Hover effect */
.delete-btn:hover {
    background-color: #c0392b;
    transform: scale(1.1);
}


    .all-students-report {
        margin: 20px 0;
        overflow-x: auto;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .report-table th {
        background-color: var(--primary-color);
        color: white;
        padding: 12px 15px;
        text-align: left;
        font-weight: 600;
    }

    .report-table td {
        padding: 10px 15px;
        border-bottom: 1px solid var(--light-color);
    }

    .report-table tr:hover {
        background-color: rgba(52, 152, 219, 0.05);
    }

    .percentage-display {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .progress-bar.small {
        width: 80px;
        height: 8px;
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .status-badge.excellent {
        background-color: rgba(46, 204, 113, 0.2);
        color: #27ae60;
    }

    .status-badge.good {
        background-color: rgba(52, 152, 219, 0.2);
        color: #2980b9;
    }

    .status-badge.average {
        background-color: rgba(241, 196, 15, 0.2);
        color: #f39c12;
    }

    .status-badge.poor {
        background-color: rgba(231, 76, 60, 0.2);
        color: #c0392b;
    }

    .report-summary {
        margin-top: 30px;
        padding: 20px;
        background: var(--light-color);
        border-radius: var(--border-radius);
        text-align: center;
    }

    .report-stat::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
}

    .summary-stat {
        text-align: center;
    }

    .summary-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
    }

    .summary-label {
        font-size: 14px;
        color: var(--dark-color);
        margin-top: 5px;
    }
    
    .summary-stats {
      display: flex;
      justify-content: space-around;
    }

    @media (max-width: 768px) {
        .report-table {
            font-size: 14px;
        }

        .report-table th,
        .report-table td {
            padding: 8px 10px;
        }

        .summary-stats {
            flex-direction: column;
            gap: 15px;
        }
    }
`;
style.textContent += allStudentsReportStyle;

// --- Base CSS ---
style.textContent += `
    .fas {
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
    }
    
    .fa-user:before { content: '\\f007'; }
    .fa-edit:before { content: '\\f044'; }
    .fa-trash:before { content: '\\f1f8'; }
    
    .attendance-details-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
    }
    
    .attendance-detail-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        border-radius: var(--border-radius);
        background-color: var(--light-color);
    }
    
    .attendance-detail-item.present {
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid var(--success-color);
    }
    
    .attendance-detail-item.absent {
        background-color: rgba(231, 76, 60, 0.1);
        border-left: 4px solid var(--danger-color);
    }
    
    .daily-attendance {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
    }
    
    .daily-record {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    border-radius: var(--border-radius);
    }
    
    .daily-record.leave {
    background-color: rgba(241, 196, 15, 0.1);
    border-left: 4px solid #f1c40f;
      
    }
    
    .daily-record.present {
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid #4caf50;
    }
    
    .daily-record.absent {
        background-color: rgba(231, 76, 60, 0.1);
        border-left: 4px solid var(--danger-color);
    }
`;

// SIDEBAR TOGGLE
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");
const overlay = document.getElementById("overlay");

hamburger.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.remove("hidden");
});

// Close sidebar when clicking overlay
overlay.addEventListener("click", closeSidebar);

// Close sidebar on menu item click
document.querySelectorAll(".sidebar-menu li").forEach(item => {
    item.addEventListener("click", () => {
        const tab = item.getAttribute("data-tab");

        // Switch Tabs
        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        document.getElementById(tab).classList.add("active");

        // Close sidebar
        closeSidebar();
    });
});

// Close sidebar when clicking anywhere outside
document.addEventListener("click", (event) => {
    if (sidebar.classList.contains("active") && !sidebar.contains(event.target) && event.target !== hamburger) {
        closeSidebar();
    }
});

// SIDEBAR MENU CLICK → TAB SWITCH
document.querySelectorAll(".sidebar-menu li").forEach(item => {
    item.addEventListener("click", () => {
        const tab = item.getAttribute("data-tab");

        // Switch Tabs
        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        document.getElementById(tab).classList.add("active");

        // Highlight active tab
        document.querySelectorAll(".sidebar-menu li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");

        // Close sidebar
        closeSidebar();
    });
});


// Helper function to close sidebar
function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.add("hidden");
}

// -----------------------------
// STARTUP SCHOOL SELECTOR
// -----------------------------

document.addEventListener("DOMContentLoaded", function () {

    const selector = document.getElementById("schoolSelector");
    const closeSelector = document.getElementById("closeSelector");
    const selectorCards = document.querySelectorAll(".selector-card");

    // Show selector screen ON FIRST APP OPEN
    if (!localStorage.getItem("schoolSelected")) {
        selector.classList.remove("hidden");
    }

    // Close selector (X button)
    closeSelector.addEventListener("click", () => {
        selector.classList.add("hidden");
        localStorage.setItem("schoolSelected", "true");
    });

    // When clicking any card
    selectorCards.forEach(card => {
        card.addEventListener("click", () => {
            let page = card.getAttribute("data-link");
            localStorage.setItem("schoolSelected", "true");
            selector.classList.add("hidden");

            // Redirect to selected link
            window.location.href = page;
        });
    });

});

// -----------------------------
// MANUAL OPEN: School Selector inside the app
// -----------------------------

document.addEventListener("DOMContentLoaded", function () {
    const selector = document.getElementById("schoolSelector");
    const changeSchoolTypeBtn = document.getElementById("changeSchoolTypeBtn");

    if (changeSchoolTypeBtn) {
        changeSchoolTypeBtn.addEventListener("click", () => {
            selector.classList.remove("hidden");
        });
    }
});
