// src/utils/formatting.js
export const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date, format = 'full') => {
    const dateObj = new Date(date);

    const formats = {
        full: { year: 'numeric', month: 'long', day: 'numeric' },
        short: { year: '2-digit', month: 'short', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
    };

    // Changed to en-US for English formatting
    return new Intl.DateTimeFormat('en-US', formats[format]).format(dateObj);
};

export const formatPhoneNumber = (phone) => {
    // Spanish phone format: +34 XXX XX XX XX
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})(\d{2})$/);

    if (match) {
        return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }

    return phone;
};

export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};