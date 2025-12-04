import { test, expect } from '@playwright/test';

test.describe('AbsenceHub - Complete CRUD Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    // Wait for initial data load
    await page.waitForLoadState('networkidle');
  });

  test('should display the application with initial data', async ({ page }) => {
    // Check header is visible
    await expect(page.locator('h1')).toContainText('AbsenceHub');

    // Check subtitle is visible
    await expect(page.locator('text=Employee Absence Management System')).toBeVisible();

    // Check Add Absence button exists
    await expect(page.locator('button:has-text("Add Absence")')).toBeVisible();

    // Check table is visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create a new absence', async ({ page }) => {
    // Click Add Absence button
    await page.click('button:has-text("Add Absence")');

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Fill in form fields
    await page.fill('input[name="service_account"]', 's.john.doe');
    await page.fill('input[name="employee_fullname"]', 'John Doe');
    await page.selectOption('select[name="absence_type"]', 'Urlaub');
    await page.fill('input[name="start_date"]', '2025-12-10');
    await page.fill('input[name="end_date"]', '2025-12-15');

    // Submit form
    await page.click('button:has-text("Submit")');

    // Wait for success message
    await expect(page.locator('[role="status"]')).toContainText('created successfully');

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify new absence appears in table
    await expect(page.locator('text=s.john.doe')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click Add Absence button
    await page.click('button:has-text("Add Absence")');

    // Try to submit empty form
    await page.click('button:has-text("Submit")');

    // Check for validation errors
    await expect(page.locator('text=Service account is required')).toBeVisible();
    await expect(page.locator('text=Absence type is required')).toBeVisible();
    await expect(page.locator('text=Start date is required')).toBeVisible();
    await expect(page.locator('text=End date is required')).toBeVisible();

    // Modal should still be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should validate service account format', async ({ page }) => {
    // Click Add Absence button
    await page.click('button:has-text("Add Absence")');

    // Enter invalid service account
    await page.fill('input[name="service_account"]', 'invalid.account');

    // Blur the field to trigger validation
    await page.click('input[name="absence_type"]');

    // Check for error
    await expect(page.locator('text=Service account must start with')).toBeVisible();
  });

  test('should validate date range', async ({ page }) => {
    // Click Add Absence button
    await page.click('button:has-text("Add Absence")');

    // Fill in form with end date before start date
    await page.fill('input[name="service_account"]', 's.john.doe');
    await page.fill('input[name="absence_type"]', 'Urlaub');
    await page.fill('input[name="start_date"]', '2025-12-15');
    await page.fill('input[name="end_date"]', '2025-12-10');

    // Try to submit
    await page.click('button:has-text("Submit")');

    // Check for date range error
    await expect(page.locator('text=End date cannot be before start date')).toBeVisible();
  });

  test('should edit an existing absence', async ({ page }) => {
    // Find and click edit button on first absence
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check that service account is disabled in edit mode
    const serviceAccountField = page.locator('input[name="service_account"]');
    await expect(serviceAccountField).toBeDisabled();

    // Change employee fullname
    const fullnameField = page.locator('input[name="employee_fullname"]');
    await fullnameField.clear();
    await fullnameField.fill('Updated Name');

    // Submit form
    await page.click('button:has-text("Submit")');

    // Wait for success message
    await expect(page.locator('[role="status"]')).toContainText('updated successfully');

    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should delete an absence with confirmation', async ({ page }) => {
    // Find and click delete button on first absence
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Wait for confirmation dialog
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();

    // Check confirmation message
    await expect(page.locator('text=Are you sure you want to delete this absence?')).toBeVisible();

    // Click confirm
    await page.click('button:has-text("Confirm")');

    // Wait for success message
    await expect(page.locator('[role="status"]')).toContainText('deleted successfully');

    // Verify dialog closes
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible();
  });

  test('should cancel delete operation', async ({ page }) => {
    // Get initial absence count
    const initialCount = await page.locator('table tbody tr').count();

    // Find and click delete button on first absence
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Wait for confirmation dialog
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Verify dialog closes
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible();

    // Verify count unchanged
    const finalCount = await page.locator('table tbody tr').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should filter absences by service account', async ({ page }) => {
    // Find service account in first row
    const firstServiceAccount = await page.locator('table tbody tr td').first().textContent();

    // Fill in filter
    await page.fill('input[placeholder*="Service Account"]', firstServiceAccount);

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait for filtering
    await page.waitForLoadState('networkidle');

    // Check that only matching absences are shown
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Verify all rows contain the service account
    const serviceAccounts = await page.locator('table tbody tr td:first-child').allTextContents();
    serviceAccounts.forEach((account) => {
      expect(account).toContain(firstServiceAccount);
    });
  });

  test('should filter absences by absence type', async ({ page }) => {
    // Click absence type filter
    await page.selectOption('select[name="absence_type"]', 'Urlaub');

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait for filtering
    await page.waitForLoadState('networkidle');

    // Verify results (at least one should be visible or empty message)
    const emptyMessage = await page.locator('text=No absences found').isVisible();
    const hasRows = await page.locator('table tbody tr').count();

    expect(emptyMessage || hasRows > 0).toBeTruthy();
  });

  test('should clear filters', async ({ page }) => {
    // Apply some filter
    await page.fill('input[placeholder*="Service Account"]', 's.test');
    await page.click('button:has-text("Apply Filters")');
    await page.waitForLoadState('networkidle');

    // Click clear filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForLoadState('networkidle');

    // Check that input is cleared
    await expect(page.locator('input[placeholder*="Service Account"]')).toHaveValue('');
  });

  test('should switch language to German', async ({ page }) => {
    // Change language to German
    await page.selectOption('#language-selector', 'de');

    // Verify UI text changed to German
    await expect(page.locator('text=Verwaltungssystem für Mitarbeiterabwesenheiten')).toBeVisible();

    // Verify buttons are in German
    await expect(page.locator('button:has-text("Abwesenheit hinzufügen")')).toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    // Open form
    await page.click('button:has-text("Add Absence")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should show statistics', async ({ page }) => {
    // Check for statistics section
    const statsSection = page.locator('text=Total Absences');
    await expect(statsSection).toBeVisible();

    // Check for unique employees stat
    await expect(page.locator('text=Unique Employees')).toBeVisible();

    // Check for by type stat
    await expect(page.locator('text=Absences by Type')).toBeVisible();
  });

  test('should persist language preference on reload', async ({ page }) => {
    // Change to German
    await page.selectOption('#language-selector', 'de');
    await expect(page.locator('text=Verwaltungssystem für Mitarbeiterabwesenheiten')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // German should still be selected
    const languageSelector = page.locator('#language-selector');
    await expect(languageSelector).toHaveValue('de');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/absences', (route) => {
      route.abort('failed');
    });

    // Reload to trigger error
    await page.reload();
    await page.waitForTimeout(2000);

    // Check error message is displayed
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Error loading absences')).toBeVisible();
  });
});
