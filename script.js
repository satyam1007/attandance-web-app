// Online Attendance Web App

// Global variables
let currentClass = '';
let currentSection = '';
let students = [];
let attendanceRecords = [];
let editingStudentId = null;

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
    
    // Render initial views
    renderStudents();
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
            </div>
            <div class="student-actions">
                <button class="action-btn edit" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i>
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
    
    if (!name || !roll) {
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
            completeStudentSave(name, roll, imageBase64);
        };
        reader.readAsDataURL(file);
    } else {
        // If no new image, keep the existing one when editing
        if (editingStudentId) {
            const existingStudent = students.find(s => s.id === editingStudentId);
            imageBase64 = existingStudent ? existingStudent.image : '';
        }
        completeStudentSave(name, roll, imageBase64);
    }
}

/**
 * Complete the student save operation after image processing
 * @param {string} name - Student name
 * @param {number} roll - Student roll number
 * @param {string} imageBase64 - Student image as base64 string
 */
function completeStudentSave(name, roll, imageBase64) {
    if (editingStudentId) {
        // Update existing student
        const studentIndex = students.findIndex(s => s.id === editingStudentId);
        if (studentIndex !== -1) {
            students[studentIndex] = {
                ...students[studentIndex],
                name,
                roll,
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
    populateStudentSelect();
    
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
    
    // Update UI
    renderStudents();
    populateStudentSelect();
    
    showToast('Student deleted successfully', 'success');
}

/**
 * Populate the student select dropdown for reports
 */
function populateStudentSelect() {
    studentSelect.innerHTML = '<option value="">Select a student</option>';
    
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
        const status = toggle.classList.contains('present') ? 'Present' : 'Absent';
        
        if (student) {
            attendanceData.push({
                roll: student.roll,
                name: student.name,
                status: status
            });
        }
    });
    
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
 * Generate a student report for the selected month
 */
function generateStudentReport() {
    const studentId = studentSelect.value;
    const month = reportMonth.value;
    
    if (!studentId || !month) {
        showToast('Please select both a student and a month', 'error');
        return;
    }
    
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
    
    monthRecords.forEach(record => {
        const studentRecord = record.students.find(s => s.roll === student.roll);
        if (studentRecord) {
            if (studentRecord.status === 'Present') {
                presentCount++;
            } else {
                absentCount++;
            }
        } else {
            // If student not found in record, count as absent
            absentCount++;
        }
    });
    
    const totalDays = presentCount + absentCount;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
    
    // Generate HTML for report
    let reportHTML = `
        <div class="report-header">
            <h3>Attendance Report for ${student.name}</h3>
            <div>Month: ${formatMonth(month)}</div>
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
            const status = studentRecord ? studentRecord.status : 'Absent';
            const statusClass = status === 'Present' ? 'present' : 'absent';
            
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
    
    // Create CSV header
    let csvContent = 'Roll No,Name\n';
    
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
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }
    
    // Use jsPDF to create PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Student Attendance Report`, 20, 20);
    
    // Add student and month info
    doc.setFontSize(12);
    doc.text(`Student: ${student.name} (Roll No: ${student.roll})`, 20, 35);
    doc.text(`Class: ${currentClass} - Section: ${currentSection}`, 20, 45);
    doc.text(`Month: ${formatMonth(month)}`, 20, 55);
    
    // Parse the selected month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    // Filter attendance records for the selected month
    const monthRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Calculate attendance statistics
    let presentCount = 0;
    let absentCount = 0;
    
    monthRecords.forEach(record => {
        const studentRecord = record.students.find(s => s.roll === student.roll);
        if (studentRecord) {
            if (studentRecord.status === 'Present') {
                presentCount++;
            } else {
                absentCount++;
            }
        } else {
            absentCount++;
        }
    });
    
    const totalDays = presentCount + absentCount;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
    
    // Add statistics
    doc.text(`Present: ${presentCount} days`, 20, 70);
    doc.text(`Absent: ${absentCount} days`, 20, 80);
    doc.text(`Total: ${totalDays} days`, 20, 90);
    doc.text(`Attendance Rate: ${percentage}%`, 20, 100);
    
    // Create table data for daily attendance
    const tableData = monthRecords.map(record => {
        const studentRecord = record.students.find(s => s.roll === student.roll);
        const status = studentRecord ? studentRecord.status : 'Absent';
        
        return [
            formatDate(record.date),
            status
        ];
    });
    
    // Add table
    if (tableData.length > 0) {
        doc.autoTable({
            startY: 110,
            head: [['Date', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [52, 152, 219] },
            styles: { fontSize: 10 }
        });
    }
    
    // Save the PDF
    doc.save(`report_${student.name}_${month}.pdf`);
    showToast('Report exported as PDF successfully', 'success');
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

// Add CSS for Font Awesome icons (since we're using them in the UI)
const style = document.createElement('style');
style.textContent = `
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
        background-color: var(--light-color);
    }
    
    .daily-record.present {
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid var(--success-color);
    }
    
    .daily-record.absent {
        background-color: rgba(231, 76, 60, 0.1);
        border-left: 4px solid var(--danger-color);
    }
`;
document.head.appendChild(style);
