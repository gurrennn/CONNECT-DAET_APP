// ============================================================
// TIA-DAS Form Validation
// Tourism Impact Assessment and Data Analytics System
// ============================================================

// ─── Generic Validators ──────────────────────────────────────

export function required(value, label = 'This field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required.`
  }
  return null
}

export function positiveNumber(value, label = 'Value') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required.`
  }
  const num = Number(value)
  if (isNaN(num)) return `${label} must be a number.`
  if (num < 0) return `${label} must be 0 or greater.`
  return null
}

export function minValue(value, min, label = 'Value') {
  const num = Number(value)
  if (isNaN(num)) return `${label} must be a number.`
  if (num < min) return `${label} must be at least ${min}.`
  return null
}

export function maxValue(value, max, label = 'Value') {
  const num = Number(value)
  if (isNaN(num)) return `${label} must be a number.`
  if (num > max) return `${label} must not exceed ${max}.`
  return null
}

export function validDate(value, label = 'Date') {
  if (!value) return `${label} is required.`
  const d = new Date(value)
  if (isNaN(d.getTime())) return `${label} must be a valid date.`
  return null
}

export function notFutureDate(value, label = 'Date') {
  const dateErr = validDate(value, label)
  if (dateErr) return dateErr
  if (new Date(value) > new Date()) return `${label} cannot be in the future.`
  return null
}

export function maxLength(value, max, label = 'Field') {
  if (value && value.length > max) return `${label} must not exceed ${max} characters.`
  return null
}

export function validEmail(value, label = 'Email') {
  if (!value) return `${label} is required.`
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) return `${label} must be a valid email address.`
  return null
}

// ─── Specific Form Validators ────────────────────────────────

/**
 * Validate tourism statistics record form
 */
export function validateStatisticsForm(data) {
  const errors = {}

  const dateErr = notFutureDate(data.reporting_date, 'Reporting date')
  if (dateErr) errors.reporting_date = dateErr

  const destErr = required(data.destination, 'Destination')
  if (destErr) errors.destination = destErr

  const localErr = positiveNumber(data.local_tourist_count, 'Local tourist count')
  if (localErr) errors.local_tourist_count = localErr

  const foreignErr = positiveNumber(data.foreign_tourist_count, 'Foreign tourist count')
  if (foreignErr) errors.foreign_tourist_count = foreignErr

  const catErr = required(data.visitor_category, 'Visitor category')
  if (catErr) errors.visitor_category = catErr

  const srcErr = required(data.data_source, 'Data source')
  if (srcErr) errors.data_source = srcErr

  const remarksErr = maxLength(data.remarks, 500, 'Remarks')
  if (remarksErr) errors.remarks = remarksErr

  return errors
}

/**
 * Validate economic record form
 */
export function validateEconomicForm(data) {
  const errors = {}

  const dateErr = notFutureDate(data.record_date, 'Record date')
  if (dateErr) errors.record_date = dateErr

  const categoryErr = required(data.category, 'Category')
  if (categoryErr) errors.category = categoryErr

  const amountErr = positiveNumber(data.estimated_amount, 'Estimated amount')
  if (amountErr) errors.estimated_amount = amountErr

  const srcErr = required(data.data_source, 'Data source')
  if (srcErr) errors.data_source = srcErr

  const descErr = maxLength(data.description, 500, 'Description')
  if (descErr) errors.description = descErr

  return errors
}

/**
 * Validate sustainability record form
 */
export function validateSustainabilityForm(data) {
  const errors = {}

  const dateErr = notFutureDate(data.record_date, 'Record date')
  if (dateErr) errors.record_date = dateErr

  const categoryErr = required(data.category, 'Category')
  if (categoryErr) errors.category = categoryErr

  const indicatorErr = required(data.indicator_name, 'Indicator name')
  if (indicatorErr) errors.indicator_name = indicatorErr

  if (data.indicator_value !== '' && data.indicator_value !== null && data.indicator_value !== undefined) {
    const valErr = positiveNumber(data.indicator_value, 'Indicator value')
    if (valErr) errors.indicator_value = valErr
  }

  const noteErr = maxLength(data.notes, 500, 'Notes')
  if (noteErr) errors.notes = noteErr

  return errors
}

/**
 * Validate admin user form
 */
export function validateAdminForm(data, isNew = true) {
  const errors = {}

  const nameErr = required(data.full_name, 'Full name')
  if (nameErr) errors.full_name = nameErr

  const emailErr = validEmail(data.email)
  if (emailErr) errors.email = emailErr

  const roleErr = required(data.role, 'Role')
  if (roleErr) errors.role = roleErr

  if (isNew) {
    if (!data.password) {
      errors.password = 'Password is required.'
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
  }

  return errors
}

/**
 * Validate report generation form
 */
export function validateReportForm(data) {
  const errors = {}

  const typeErr = required(data.report_type, 'Report type')
  if (typeErr) errors.report_type = typeErr

  if (data.period_type === 'custom') {
    const startErr = validDate(data.start_date, 'Start date')
    if (startErr) errors.start_date = startErr

    const endErr = validDate(data.end_date, 'End date')
    if (endErr) errors.end_date = endErr

    if (!startErr && !endErr) {
      if (new Date(data.start_date) > new Date(data.end_date)) {
        errors.end_date = 'End date must be after start date.'
      }
    }
  }

  return errors
}

/**
 * Collect all validation errors into a flat array of messages
 */
export function getErrorMessages(errors) {
  return Object.values(errors).filter(Boolean)
}

/**
 * Returns true if the errors object has no errors
 */
export function isValid(errors) {
  return Object.keys(errors).length === 0
}
