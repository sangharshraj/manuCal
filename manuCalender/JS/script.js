class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.today = new Date();
    this.events = this.loadEventsFromStorage();
    this.eventFilter = null;

    // Initialize with sample events
    if (Object.keys(this.events).length === 0) {
      this.initializeSampleEvents();
    }

    this.render();
  }

  initializeSampleEvents() {
    const october2024 = new Date(2024, 9); // October is month 9 (0-indexed)

    // Add sample events matching the original design
    this.events = {
      "2024-10-01": [{ title: "Important Task", type: "task" }],
      "2024-10-14": [
        { title: "Court Order Review", type: "order" },
        { title: "Document Filing", type: "order" },
      ],
      "2024-10-24": [
        { title: "Motion Hearing", type: "order" },
        { title: "Case Review", type: "order" },
        { title: "Client Meeting", type: "order" },
      ],
      "2024-10-30": [
        { title: "Deadline Reminder", type: "task" },
        { title: "Follow-up Task", type: "task" },
      ],
    };

    // Set current date to October 2024 and select day 10
    this.currentDate = new Date(2024, 9, 1);
    this.selectedDate = new Date(2024, 9, 10);

    this.saveEventsToStorage();
  }

  loadEventsFromStorage() {
    // Store events in memory only (localStorage not supported in Claude artifacts)
    return {};
  }

  saveEventsToStorage() {
    // Events are stored in memory during session
    console.log("Events saved to memory:", this.events);
  }

  render() {
    this.renderHeader();
    this.renderCalendar();
    this.renderSelectedDateEvents();
  }

  renderHeader() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    document.getElementById("monthYear").textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    // Day headers
    const dayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    dayHeaders.forEach((day) => {
      const header = document.createElement("div");
      header.className = "day-header";
      header.textContent = day;
      grid.appendChild(header);
    });

    // Get first day of month and adjust for Monday start
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    let startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Render 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const cell = this.createDayCell(cellDate);
      grid.appendChild(cell);
    }
  }

  createDayCell(date) {
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.textContent = date.getDate();

    const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
    const isToday = this.isSameDate(date, this.today);
    const isSelected = this.isSameDate(date, this.selectedDate);

    if (isCurrentMonth) {
      cell.classList.add("current-month");
    } else {
      cell.classList.add("other-month");
    }

    if (isToday) {
      cell.classList.add("today");
    }

    if (isSelected) {
      cell.classList.add("selected");
    }

    // Add events
    const dateKey = this.formatDateKey(date);
    const dayEvents = this.events[dateKey] || [];

    if (dayEvents.length > 0) {
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "event-dots";

      dayEvents.forEach((event) => {
        if (event && event.type && (!this.eventFilter || event.type === this.eventFilter)) {
          const dot = document.createElement("div");
          dot.className = `event-dot dot-${event.type}`;
          dot.title = event.title || "Event";
          dotsContainer.appendChild(dot);
        }
      });

      if (dotsContainer.children.length > 0) {
        cell.appendChild(dotsContainer);
      }
    }

    cell.addEventListener("click", () => this.selectDate(date));

    return cell;
  }

  selectDate(date) {
    this.selectedDate = new Date(date);
    this.render();
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  goToToday() {
    this.currentDate = new Date(this.today);
    this.selectedDate = new Date(this.today);
    this.render();
  }

  toggleEventForm() {
    const form = document.getElementById("eventForm");
    const btn = document.getElementById("addEventBtn");

    if (form.classList.contains("show")) {
      form.classList.remove("show");
      btn.textContent = "Add Event";
      this.clearEventForm();
    } else {
      form.classList.add("show");
      btn.textContent = "Cancel";
      document.getElementById("eventDate").value = this.formatDateForInput(this.selectedDate);
    }
  }

  addEvent() {
    const title = document.getElementById("eventTitle").value.trim();
    const type = document.getElementById("eventType").value;
    const date = document.getElementById("eventDate").value;

    if (!title || !date) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const dateKey = date;
      if (!this.events[dateKey]) {
        this.events[dateKey] = [];
      }

      this.events[dateKey].push({ title, type });
      this.saveEventsToStorage();
      this.toggleEventForm();
      this.render();
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error adding event. Please try again.");
    }
  }

  clearEventForm() {
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventType").value = "court-hearing";
    document.getElementById("eventDate").value = "";
  }

  clearEvents() {
    if (confirm("Are you sure you want to clear all events?")) {
      this.events = {};
      this.saveEventsToStorage();
      this.render();
    }
  }

  filterEvents(type) {
    this.eventFilter = this.eventFilter === type ? null : type;

    // Update legend styling
    document.querySelectorAll(".legend-item").forEach((item) => {
      const itemText = item.textContent.toLowerCase();
      const typeText = type.replace("-", " ");
      if (itemText.includes(typeText)) {
        if (this.eventFilter === type) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      } else {
        item.classList.remove("active");
      }
    });

    this.render();
  }

  renderSelectedDateEvents() {
    const container = document.getElementById("eventList");
    if (!container) return;

    const dateKey = this.formatDateKey(this.selectedDate);
    const events = this.events[dateKey] || [];

    if (events.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #666; font-size: 14px; padding: 20px;">No events for selected date</div>';
      return;
    }

    container.innerHTML = `
                  <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px;">
                      Events for ${this.formatDateDisplay(this.selectedDate)}
                  </div>
              `;

    events.forEach((event, index) => {
      if (event && event.title && event.type) {
        const eventItem = document.createElement("div");
        eventItem.className = "event-item";
        eventItem.innerHTML = `
                          <div style="display: flex; align-items: center;">
                              <div class="event-type dot-${event.type}"></div>
                              <span>${this.escapeHtml(event.title)}</span>
                          </div>
                          <button class="delete-event" onclick="calendar.deleteEvent('${dateKey}', ${index})">×</button>
                      `;
        container.appendChild(eventItem);
      }
    });
  }

  escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  deleteEvent(dateKey, index) {
    if (confirm("Delete this event?")) {
      if (this.events[dateKey] && this.events[dateKey][index]) {
        this.events[dateKey].splice(index, 1);
        if (this.events[dateKey].length === 0) {
          delete this.events[dateKey];
        }
        this.saveEventsToStorage();
        this.render();
      }
    }
  }

  isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }

  formatDateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  formatDateForInput(date) {
    return this.formatDateKey(date);
  }

  formatDateDisplay(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }
}

// Initialize calendar
const calendar = new Calendar();
