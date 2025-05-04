describe('reorder tasks', () => {
  beforeEach(() => {
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
  })

  it('swaps order of incomplete tasks', () => {
    // Arrange

    // Act
    cy.get('#incomplete-task-list .task').contains('My Second Task')
      .drag('.task', { destination: '#incomplete-task-list .task' })

    // Assert
    cy.get('#incomplete-task-list .task').first().contains('My Second Task')
    cy.get('#incomplete-task-list .task').last().contains('My First Task')
  })

  it('keeps new order after page reload', () => {
    // Arrange
    cy.get('#incomplete-task-list .task').contains('My Second Task')
      .drag('.task', { destination: '#incomplete-task-list .task' })

    // Act
    cy.reload()

    // Assert
    cy.get('#incomplete-task-list .task').first().contains('My Second Task')
    cy.get('#incomplete-task-list .task').last().contains('My First Task')
  })

  it('keeps completed archived task even after dragging', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Archived Task{enter}')
    cy.get('#selected-task-container').within(() => {
      cy.get('input[type="checkbox"][title="Mark task complete"]').click()
      cy.get('button > svg.fa-ellipsis-vertical').click()
      cy.get('button').contains('Archive').click()
    })

    // Act
    cy.get('#incomplete-task-list .task').contains('My Second Task')
      .drag('.task', { destination: '#incomplete-task-list .task', position: 'top' })

    // Assert
    cy.get('nav.navbar').get('.nav-item').contains('Archive').click()
    cy.get('#archive-dropdown-menu').contains('My Archived Task').should('be.visible')
  })

  it('keeps incomplete archived task even after dragging', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Archived Task{enter}')
    cy.get('#selected-task-container').within(() => {
      cy.get('button > svg.fa-ellipsis-vertical').click()
      cy.get('button').contains('Archive').click()
    })

    // Act
    cy.get('#incomplete-task-list .task').contains('My Second Task')
      .drag('.task', { destination: '#incomplete-task-list .task', position: 'top' })

    // Assert
    cy.get('nav.navbar').get('.nav-item').contains('Archive').click()
    cy.get('#archive-dropdown-menu').contains('My Archived Task').should('be.visible')
  })

  it('inserts new task at bottom of list by default', () => {
    // Arrange

    // Act
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Third Task{enter}')

    // Assert
    cy.get('#incomplete-task-list .task').last().contains('My Third Task')
  })
})
