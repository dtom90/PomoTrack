describe('create rewards', () => {
  // beforeEach(() => {
  // })

  // it('opens a modal when rewards button in completed section clicked', () => {
  //   // Arrange
  //   // (No specific arrangement needed for this test)
  //
  //   // Act
  //   cy.get('#completed-tasks-section button').contains('Rewards').click()
  //
  //   // Assert
  //   cy.get('div.modal-dialog').contains('Rewards').should('be.visible')
  // })
  //
  // it('creates a reward when a task is completed', () => {
  //   // Arrange
  //   cy.get('input[placeholder="enter new task"]')
  //     .click()
  //     .type('My First Task{enter}')
  //  
  //   // Act
  //   cy.get('#selected-task-container input[type="checkbox"][title="Mark task complete"]').click()
  //  
  //   // Assert
  //   cy.get('#completed-tasks-section button').contains('Rewards').click()
  //   cy.get('div.modal-dialog').within(() => {
  //     cy.contains('Rewards').should('be.visible')
  //     cy.get('div').contains('My First Task').should('be.visible')
  //     cy.get('button').contains('Cash In').should('be.visible')
  //   })
  // })
  
  it('preserves rewards on page reload', () => {
    // Arrange
    cy.get('input[placeholder="enter new task"]')
      .click()
      .type('My First Task{enter}')
    cy.get('#selected-task-container input[type="checkbox"][title="Mark task complete"]').click()

    // Act
    cy.reload()

    // Assert
    cy.get('#completed-tasks-section button').contains('Rewards').click()
    cy.get('div.modal-dialog').within(() => {
      cy.contains('Rewards').should('be.visible')
      cy.get('div').contains('My First Task').should('be.visible')
      cy.get('button').contains('Cash In').should('be.visible')
    })
  })

  // it('cashes in reward when button is clicked', () => {
  //   // Arrange
  //   cy.get('input[placeholder="enter new task"]')
  //     .click()
  //     .type('My First Task{enter}')
  //
  //   // Act
  //   cy.get('#selected-task-container input[type="checkbox"][title="Mark task complete"]').click()
  //
  //   // Assert
  //   cy.get('#completed-tasks-section button').contains('Rewards').click()
  //   cy.get('div.modal-dialog').within(() => {
  //     cy.contains('Rewards').should('be.visible')
  //     cy.get('div').contains('My First Task').should('be.visible')
  //     cy.get('button').contains('Cash In').should('be.visible')
  //   })
  // })
})
