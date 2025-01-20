describe('create rewards', () => {
  // beforeEach(() => {
  // })

  it('opens a modal when rewards button in completed section clicked', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('#completed-tasks-section button').contains('Rewards').click()

    // Assert
    cy.get('div.modal-dialog').contains('Rewards').should('be.visible')
  })
})
