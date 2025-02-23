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
    cy.get('#selected-task-section').contains('My First Task edited')
    cy.reload()
    cy.get('#selected-task-section').contains('My First Task edited')
  })

  it('should keep name field in edit mode even while timer is running', () => {
    // Arrange
    cy.get('button > svg.fa-play').click()

    // Act
    cy.get('#selected-task-container').contains('My First Task').click()

    // Assert
    cy.get('#countdown-container').contains('24:59')
    cy.get('#countdown-container').contains('24:58')
    cy.get('#task-name-input').should('be.visible')
  })

  it('edits the task name by clicking the name then switches to another task', () => {
    // Arrange
    cy.get('input[placeholder="enter new task"]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#selected-task-container').contains('My Second Task').click()

    // Act
    cy.get('#task-name-input').type(' edited')
    cy.get('#incomplete-task-list').contains('My First Task').click()

    // Assert
    cy.get('#selected-task-section').contains('My First Task')
    cy.get('#incomplete-task-list').contains('My Second Task edited')
  })

  it('edits the task notes by clicking the field', () => {
    // Arrange
    cy.get('span').contains('Notes:').closest('div').find('#display-notes').click()

    // Act
    cy.get('#notes-section textarea').type('My notes{enter}')
    cy.get('#notes-section').contains('Notes:').click()

    // Assert
    cy.reload()
    cy.get('#notes-section #display-notes').contains('My notes')
  })
  
  it('edits the task notes then switches to another task', () => {
    // Arrange
    cy.get('input[placeholder="enter new task"]')
      .click()
      .type('My Second Task{enter}')
    cy.get('span').contains('Notes:').closest('div').find('#display-notes').click()
    
    // Act
    cy.get('#notes-section textarea').type('My notes{enter}')
    cy.get('#incomplete-task-list').contains('My First Task').click()
    
    // Assert
    cy.get('#incomplete-task-list').contains('My Second Task').click()
    cy.get('#notes-section #display-notes').contains('My notes')
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
