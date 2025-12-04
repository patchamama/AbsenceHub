/**
 * Internationalization utilities
 */

const translations = {
  en: {
    // Header & Navigation
    'app.title': 'AbsenceHub',
    'app.subtitle': 'Employee Absence Management System',
    'nav.absences': 'Absences',
    'nav.statistics': 'Statistics',
    'nav.language': 'Language',

    // Page Titles
    'page.absences': 'Absence Management',
    'page.statistics': 'Statistics',

    // Absence Form
    'form.title.create': 'Create New Absence',
    'form.title.edit': 'Edit Absence',
    'form.serviceAccount': 'Service Account',
    'form.serviceAccountPlaceholder': 's.john.doe',
    'form.employeeFullname': 'Employee Fullname',
    'form.employeeFullnamePlaceholder': 'John Doe (optional)',
    'form.absenceType': 'Absence Type',
    'form.startDate': 'Start Date',
    'form.endDate': 'End Date',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    'form.reset': 'Reset',

    // Absence Types
    'absence.Urlaub': 'Vacation',
    'absence.Krankheit': 'Sick Leave',
    'absence.Home Office': 'Home Office',
    'absence.Sonstige': 'Other',

    // Absence List
    'list.title': 'Absences',
    'list.empty': 'No absences found',
    'list.serviceAccount': 'Service Account',
    'list.employeeName': 'Employee Name',
    'list.type': 'Type',
    'list.startDate': 'Start Date',
    'list.endDate': 'End Date',
    'list.duration': 'Duration',
    'list.created': 'Created',
    'list.actions': 'Actions',
    'list.days': 'days',
    'list.day': 'day',

    // Filters
    'filter.title': 'Filters',
    'filter.serviceAccount': 'Service Account',
    'filter.absenceType': 'Absence Type',
    'filter.startDate': 'From Date',
    'filter.endDate': 'To Date',
    'filter.apply': 'Apply Filters',
    'filter.clear': 'Clear Filters',
    'filter.all': 'All',

    // Buttons
    'button.add': 'Add Absence',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'button.close': 'Close',
    'button.save': 'Save',
    'button.confirm': 'Confirm',

    // Messages
    'message.createdSuccess': 'Absence created successfully',
    'message.updatedSuccess': 'Absence updated successfully',
    'message.deletedSuccess': 'Absence deleted successfully',
    'message.deleteConfirm': 'Are you sure you want to delete this absence?',
    'message.loadingError': 'Error loading absences. Please try again.',
    'message.savingError': 'Error saving absence. Please try again.',
    'message.deletingError': 'Error deleting absence. Please try again.',

    // Validation Errors
    'error.serviceAccountRequired': 'Service account is required',
    'error.serviceAccountFormat': "Service account must start with 's.'",
    'error.serviceAccountStructure': 'Service account must follow format: s.firstname.lastname',
    'error.absenceTypeRequired': 'Absence type is required',
    'error.absenceTypeInvalid': 'Invalid absence type',
    'error.startDateRequired': 'Start date is required',
    'error.endDateRequired': 'End date is required',
    'error.dateRangeInvalid': 'End date cannot be before start date',
    'error.dateFormatInvalid': 'Invalid date format',
    'error.overlapError': 'This absence overlaps with an existing absence of the same type',

    // Statistics
    'stats.title': 'Statistics',
    'stats.totalAbsences': 'Total Absences',
    'stats.uniqueEmployees': 'Unique Employees',
    'stats.byType': 'Absences by Type',
  },
  de: {
    // Header & Navigation
    'app.title': 'AbsenceHub',
    'app.subtitle': 'Verwaltungssystem für Mitarbeiterabwesenheiten',
    'nav.absences': 'Abwesenheiten',
    'nav.statistics': 'Statistiken',
    'nav.language': 'Sprache',

    // Page Titles
    'page.absences': 'Abwesenheitsverwaltung',
    'page.statistics': 'Statistiken',

    // Absence Form
    'form.title.create': 'Neue Abwesenheit erstellen',
    'form.title.edit': 'Abwesenheit bearbeiten',
    'form.serviceAccount': 'Service-Konto',
    'form.serviceAccountPlaceholder': 's.john.doe',
    'form.employeeFullname': 'Name des Mitarbeiters',
    'form.employeeFullnamePlaceholder': 'John Doe (optional)',
    'form.absenceType': 'Abwesenheitstyp',
    'form.startDate': 'Startdatum',
    'form.endDate': 'Enddatum',
    'form.submit': 'Absenden',
    'form.cancel': 'Abbrechen',
    'form.reset': 'Zurücksetzen',

    // Absence Types
    'absence.Urlaub': 'Urlaub',
    'absence.Krankheit': 'Krankheit',
    'absence.Home Office': 'Home Office',
    'absence.Sonstige': 'Sonstige',

    // Absence List
    'list.title': 'Abwesenheiten',
    'list.empty': 'Keine Abwesenheiten gefunden',
    'list.serviceAccount': 'Service-Konto',
    'list.employeeName': 'Name des Mitarbeiters',
    'list.type': 'Typ',
    'list.startDate': 'Startdatum',
    'list.endDate': 'Enddatum',
    'list.duration': 'Dauer',
    'list.created': 'Erstellt',
    'list.actions': 'Aktionen',
    'list.days': 'Tage',
    'list.day': 'Tag',

    // Filters
    'filter.title': 'Filter',
    'filter.serviceAccount': 'Service-Konto',
    'filter.absenceType': 'Abwesenheitstyp',
    'filter.startDate': 'Von Datum',
    'filter.endDate': 'Bis Datum',
    'filter.apply': 'Filter anwenden',
    'filter.clear': 'Filter löschen',
    'filter.all': 'Alle',

    // Buttons
    'button.add': 'Abwesenheit hinzufügen',
    'button.edit': 'Bearbeiten',
    'button.delete': 'Löschen',
    'button.close': 'Schließen',
    'button.save': 'Speichern',
    'button.confirm': 'Bestätigen',

    // Messages
    'message.createdSuccess': 'Abwesenheit erfolgreich erstellt',
    'message.updatedSuccess': 'Abwesenheit erfolgreich aktualisiert',
    'message.deletedSuccess': 'Abwesenheit erfolgreich gelöscht',
    'message.deleteConfirm': 'Sind Sie sicher, dass Sie diese Abwesenheit löschen möchten?',
    'message.loadingError': 'Fehler beim Laden der Abwesenheiten. Bitte versuchen Sie es erneut.',
    'message.savingError': 'Fehler beim Speichern der Abwesenheit. Bitte versuchen Sie es erneut.',
    'message.deletingError': 'Fehler beim Löschen der Abwesenheit. Bitte versuchen Sie es erneut.',

    // Validation Errors
    'error.serviceAccountRequired': 'Service-Konto erforderlich',
    'error.serviceAccountFormat': "Service-Konto muss mit 's.' beginnen",
    'error.serviceAccountStructure': 'Service-Konto muss dem Format entsprechen: s.vorname.nachname',
    'error.absenceTypeRequired': 'Abwesenheitstyp erforderlich',
    'error.absenceTypeInvalid': 'Ungültiger Abwesenheitstyp',
    'error.startDateRequired': 'Startdatum erforderlich',
    'error.endDateRequired': 'Enddatum erforderlich',
    'error.dateRangeInvalid': 'Enddatum kann nicht vor dem Startdatum liegen',
    'error.dateFormatInvalid': 'Ungültiges Datumsformat',
    'error.overlapError': 'Diese Abwesenheit überlappt sich mit einer bestehenden Abwesenheit desselben Typs',

    // Statistics
    'stats.title': 'Statistiken',
    'stats.totalAbsences': 'Gesamtabwesenheiten',
    'stats.uniqueEmployees': 'Eindeutige Mitarbeiter',
    'stats.byType': 'Abwesenheiten nach Typ',
  },
}

let currentLanguage = localStorage.getItem('language') || 'en'

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang
    localStorage.setItem('language', lang)
    window.dispatchEvent(new Event('languagechange'))
  }
}

export const getLanguage = () => currentLanguage

export const t = (key, defaultValue = key) => {
  const translation = translations[currentLanguage]?.[key]
  return translation || translations.en[key] || defaultValue
}

export const getAvailableLanguages = () => Object.keys(translations)

export default {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
}
