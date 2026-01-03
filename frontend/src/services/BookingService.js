const SESSION_KEY = 'incx_guest_session';

export const BookingService = {
  

  getSessionId: () => {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  },

  getMyBookings: async () => {
    const sessionId = BookingService.getSessionId();
    try {
      const response = await fetch(`/api/bookings?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Fehler beim Laden");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },


  createBooking: async (bookingData) => {
    const sessionId = BookingService.getSessionId();
    

    const payload = {
      ...bookingData,
      sessionId: sessionId
    };

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Buchung fehlgeschlagen");
    }

    return result;
  }
};