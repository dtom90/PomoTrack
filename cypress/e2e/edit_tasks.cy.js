describe('create tasks', () => {
  beforeEach(() => {
    cy.get('input[placeholder="Enter new task.."]')
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

  it('prevents saving a task with a blank title', () => {
    // Arrange
    cy.get('#selected-task-container').contains('My First Task').click()

    // Act
    cy.get('#task-name-input').clear().type('{enter}')

    // Assert
    cy.get('#selected-task-section').contains('My First Task')
    cy.reload()
    cy.get('#selected-task-section').contains('My First Task')
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
    cy.get('input[placeholder="Enter new task.."]')
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

  it('edits the task notes by clicking the field and saves by hitting {enter}', () => {
    // Arrange
    cy.get('textarea[placeholder="Enter notes here.."]').click()

    // Act
    cy.get('#notes-section textarea').type('My notes{enter}')

    // Assert
    cy.reload()
    cy.get('#notes-section #display-notes').contains('My notes')
  })
  
  it('edits the task notes and saves by clicking outside', () => {
    // Arrange
    cy.get('textarea[placeholder="Enter notes here.."]').click()

    // Act
    cy.get('#notes-section textarea').type('My notes')
    cy.contains('Tags:').click()

    // Assert
    cy.reload()
    cy.get('#notes-section #display-notes').contains('My notes')
  })
  
  it('creates a newline in notes by hitting {shift}+{enter}', () => {
    // Arrange
    cy.get('textarea[placeholder="Enter notes here.."]').click()

    // Act
    cy.get('#notes-section textarea').type('My notes{shift}{enter}More notes on a new line')
    cy.contains('Tags:').click()

    // Assert
    cy.get('#notes-section #display-notes').contains('My notes')
    cy.get('#notes-section #display-notes').contains('More notes on a new line')
  })
  
  it('edits the task notes then switches to another task', () => {
    // Arrange
    cy.get('input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('textarea[placeholder="Enter notes here.."]').click()
    
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
