const busySlots = [];
  const events = $input.all();
  let targetDate = '';

  // Get target date from Standardize Data node
  try {
    const stdData = $('Standardize Data').first().json;
    if (stdData.date) {
      // Extract just the date part (YYYY-MM-DD)
      targetDate = stdData.date.split('T')[0];
    }
  } catch (e) {
    console.error('Error getting target date:', e);
  }

  console.log('Target date:', targetDate);
  console.log('Total events:', events.length);

  // Process each event
  for (const event of events) {
    const jsonData = event.json;

    // Skip if no start time
    if (!jsonData.start || (!jsonData.start.dateTime && !jsonData.start.date)) {
      continue;
    }

    const eventDateTime = jsonData.start.dateTime || jsonData.start.date;
    const eventDate = eventDateTime.split('T')[0];

    console.log('Event date:', eventDate, 'Event time:', eventDateTime);

    // Only process events on the target date
    if (targetDate && eventDate === targetDate) {
      // Extract time from ISO string
      const timePart = eventDateTime.split('T')[1];

      if (timePart) {
        // Get HH:MM
        const timeStr = timePart.substring(0, 5);
        const [hours, minutes] = timeStr.split(':').map(Number);

        // Return BOTH formats - frontend will filter based on what it needs
        // 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12;
        hour12 = hour12 === 0 ? 12 : hour12;
        const formattedTime12 = hour12.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + period;    

        // 24-hour format
        const formattedTime24 = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

        // Add both formats so frontend can match either
        busySlots.push(formattedTime12);
        busySlots.push(formattedTime24);

        console.log('Added busy slots:', formattedTime12, formattedTime24);
      }
    }
  }

  console.log('Final busy slots:', busySlots);

  return [{ json: { busySlots: busySlots } }];