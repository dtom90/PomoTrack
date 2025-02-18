describe('create tasks', () => {
  beforeEach(() => {
    cy.get('input[placeholder="enter new task"]')
      .click()
      .type('My First Task{enter}')
  })
  
  it('edits the task name by clicking the name', () => {
    // Arrange
    cy.get('#selected-task-container').contains('My First Task').click()

    // Act
    cy.get('#task-name-input').type(' edited{enter}')

    // Assert
    cy.reload()
    cy.get('#main-section').contains('My First Task edited')
  })

  it('edits the task name from the task menu', () => {
    // Arrange
    cy.get('button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Edit').click()

    // Act
    cy.get('#task-name-input').type(' edited{enter}')

    // Assert
    cy.reload()
    cy.get('#main-section').contains('My First Task edited')
  })

  it('edits the task notes', () => {
    // Act
    cy.get('#selected-task-container').contains('Notes:')
      .closest('div').find('button > svg.fa-pencil').click()
    cy.get('textarea').type('My notes{enter}')
    cy.get('#notes-section').find('button > svg.fa-floppy-disk').click()

    // Assert
    cy.reload()
    cy.get('#notes-section').contains('My notes')
  })
  
  it('edits the task timer', () => {
    // Act
    cy.get('#selected-task-container').contains('25:00').click()
    cy.get('#countdown-container input[type="number"]:visible').clear().type('30{enter}')
    
    // Assert
    cy.reload()
    cy.get('#selected-task-container').contains('30:00')
  })
})
