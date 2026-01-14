const standardizedData = $('Standardize Data').first().json;
const clientEmail = standardizedData.email || '';
const clientName = standardizedData.name || 'Client';
const meetingDate = standardizedData.date || new Date().toISOString();
const meetingTime = standardizedData.time || '10:00';
const language = standardizedData.language || 'pt';
const meetLink = $json.hangoutLink || '';

const brandBlue = '#2563eb';

const translations = {
  pt: {
    subject: 'Reuniao confirmada',
    greeting: 'Caro(a)',
    intro: 'Esta reuniao sera dedicada a analisar as necessidades especificas do seu negocio e desenvolver uma estrategia digital que aumente os seus resultados online.',
    date: 'DATA',
    time: 'HORA',
    duration: 'DURACAO',
    durationValue: '30 min',
    joinMeeting: 'Entrar na reuniao',
    calendarNote: 'O evento ja foi adicionado ao seu Google Calendar.',
    rescheduleNote: 'Caso necessite reagendar, por favor contacte-nos atraves deste email.',
    signature: 'Francisco Farias',
    role: 'Founder - Framax Solutions',
    copyright: '2025 Framax Solutions',
    meetingTitle: 'Reuniao confirmada',
    subjectShort: 'Reuniao confirmada'
  },
  en: {
    subject: 'Meeting confirmed',
    greeting: 'Dear',
    intro: 'This meeting will be dedicated to analyzing your business specific needs and developing a digital strategy that increases your online results.',
    date: 'DATE',
    time: 'TIME',
    duration: 'DURATION',
    durationValue: '30 min',
    joinMeeting: 'Join meeting',
    calendarNote: 'The event has been added to your Google Calendar.',
    rescheduleNote: 'If you need to reschedule, please contact us via this email.',
    signature: 'Francisco Farias',
    role: 'Founder - Framax Solutions',
    copyright: '2025 Framax Solutions',
    meetingTitle: 'Meeting confirmed',
    subjectShort: 'Meeting confirmed'
  }
};

const validLanguage = (language === 'pt' || language === 'en') ? language : 'pt';
const t = translations[validLanguage];

function convertTo24Hour(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return '10:00';
    }
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
        return timeStr;
    }
    const parts = timeStr.split(' ');
    const time = parts[0];
    const modifier = parts[1];
    const timeParts = time.split(':');
    let hours = timeParts[0];
    const minutes = timeParts[1];

    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
    }
    return hours.padStart(2, '0') + ':' + minutes;
}

function convertTo12Hour(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return '10:00 AM';
    }
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
        return timeStr;
    }
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const modifier = hours >= 12 ? 'PM' : 'AM';

    if (hours > 12) {
        hours = hours - 12;
    } else if (hours === 0) {
        hours = 12;
    }

    return hours.toString().padStart(2, '0') + ':' + minutes + ' ' + modifier;
}

const formattedTime24 = convertTo24Hour(meetingTime);
const formattedTime = validLanguage === 'en' ? convertTo12Hour(meetingTime) : formattedTime24;

const locale = validLanguage === 'pt' ? 'pt-PT' : 'en-US';
const dateObj = new Date(meetingDate);
const formattedDate = dateObj.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
const formattedDateShort = dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long'
});

const subjectText = t.subjectShort + ' - ' + formattedDateShort + ' - ' + formattedTime;
const encodedSubject = '=?UTF-8?B?' + Buffer.from(subjectText, 'utf-8').toString('base64') + '?=';

const htmlLang = validLanguage === 'pt' ? 'pt-PT' : 'en-US';

const meetLinkHtml = meetLink ? '<table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;"><tr><td><a href="' + meetLink + '" style="display: inline-block; padding: 14px 28px; background-color: #1e40af; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.3px; border: 2px solid #1e40af; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.25);">' + t.joinMeeting + '</a></td></tr></table>' : '';

const htmlBody = '<!DOCTYPE html><html lang="' + htmlLang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif; background-color: #fafafa;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa;"><tr><td style="padding: 50px 20px;"><table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff;"><tr><td style="padding: 56px 40px 32px 40px;"><img src="https://www.framaxsolutions.com/logos/framax-logo-black.png" alt="Framax Solutions" width="260" style="max-width: 260px; height: auto; margin-bottom: 32px; display: block;" /><h1 style="margin: 0; font-size: 28px; font-weight: 400; color: ' + brandBlue + '; line-height: 1.3; letter-spacing: -0.3px;">' + t.meetingTitle + '</h1></td></tr><tr><td style="padding: 0 40px 40px 40px;"><p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a; line-height: 1.5;">' + t.greeting + ' ' + clientName + ',</p><p style="margin: 0 0 32px 0; font-size: 16px; color: #404040; line-height: 1.6;">' + t.intro + '</p><table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0; border-left: 3px solid ' + brandBlue + '; background-color: #fafafa;"><tr><td style="padding: 28px 24px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom: 14px;"><p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">' + t.date + '</p><p style="margin: 0; font-size: 15px; color: ' + brandBlue + '; font-weight: 500; text-transform: capitalize;">' + formattedDate + '</p></td></tr><tr><td style="padding-bottom: 14px;"><p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">' + t.time + '</p><p style="margin: 0; font-size: 15px; color: ' + brandBlue + '; font-weight: 500;">' + formattedTime + '</p></td></tr><tr><td><p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">' + t.duration + '</p><p style="margin: 0; font-size: 15px; color: ' + brandBlue + '; font-weight: 500;">' + t.durationValue + '</p></td></tr></table></td></tr></table>' + meetLinkHtml + '<p style="margin: 0 0 20px 0; font-size: 15px; color: #595959; line-height: 1.6;">' + t.calendarNote + '</p><p style="margin: 0 0 32px 0; font-size: 15px; color: #737373; line-height: 1.6; font-style: italic;">' + t.rescheduleNote + '</p><div style="height: 1px; background-color: #e5e5e5; margin: 40px 0;"></div><p style="margin: 0 0 4px 0; font-size: 15px; color: #1a1a1a; font-weight: 500;">' + t.signature + '</p><p style="margin: 0 0 12px 0; font-size: 13px; color: #737373;">' + t.role + '</p><p style="margin: 0; font-size: 14px; color: #737373; line-height: 1.6;"><a href="https://framaxsolutions.com" style="color: ' + brandBlue + '; text-decoration: none;">Framaxsolutions.com</a></p></td></tr><tr><td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;"><p style="margin: 0; font-size: 12px; color: #a3a3a3;">' + t.copyright + '</p></td></tr></table></td></tr></table></body></html>';

const meetLinkPlain = meetLink ? t.joinMeeting + ': ' + meetLink + '\n\n' : '';

const plainText = 'FRAMAX SOLUTIONS\n\n' + t.meetingTitle + '\n\n' + t.greeting + ' ' + clientName + ',\n\n' + t.intro + '\n\n' + t.date + ': ' + formattedDate + '\n' + t.time + ': ' + formattedTime + '\n' + t.duration + ': ' + t.durationValue + '\n\n' + meetLinkPlain + t.calendarNote + '\n\n' + t.rescheduleNote + '\n\nFramax Solutions\nframaxsolutions.com\n\n' + t.copyright;

const boundary = '----=_Part_' + Date.now();

const emailContent = 'From: Framax Solutions <contact@framaxsolutions.com>\r\nTo: ' + clientEmail + '\r\nSubject: ' + encodedSubject + '\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative;\r\n    boundary="' + boundary + '"\r\nContent-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n' + plainText + '\r\n\r\n--' + boundary + '\r\nContent-Type: text/html; charset="UTF-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n' + htmlBody + '\r\n\r\n--' + boundary + '--';

const base64 = Buffer.from(emailContent, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

return { json: { raw: base64 } };
