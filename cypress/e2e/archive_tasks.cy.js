describe('create tasks', () => {
  beforeEach(() => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
  })

  it('archives an incomplete task', () => {
    // Act
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()

    // Assert
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()
    cy.get('#archive-dropdown').contains('My First Task').should('be.visible')
    cy.get('#incomplete-task-list').contains('My First Task').should('not.exist')
  })

  it('archives a complete task', () => {
    // Arrange
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()

    // Act
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()

    // Assert
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()
    cy.get('#archive-dropdown').contains('My First Task').should('be.visible')
    cy.get('#completed-task-list').contains('My First Task').should('not.exist')
  })

  it('restores a single task', () => {
    // Arrange
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()

    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()
    cy.get('#archive-dropdown button > svg.fa-ellipsis-vertical').click()
    cy.get('.task-submenu').contains('Restore').click()

    // Assert
    cy.get('#archive-dropdown').contains('My First Task').should('not.exist')
    cy.get('#archive-dropdown').contains('Archived tasks will appear here').should('be.visible')
    cy.get('#selected-task-container').contains('My First Task').should('be.visible')
    cy.get('#incomplete-task-list').contains('My First Task').should('be.visible')
  })

  it('archives all completed tasks, hiding them from the list', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    
    // Act
    cy.get('#completed-tasks-section button > svg.fa-ellipsis-vertical').click()
    cy.get('.dropdown-item').contains('Archive All').click()
    cy.on('window:confirm', (str) => {
      expect(str).to.equal('Are you sure that you want to archive all 2 completed tasks?')
      return true
    })

    // Assert
    cy.reload()
    cy.get('#completed-task-list .task').should('not.exist')
  })
  
  it('archives only visible completed tasks when filtering', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type('my tag' + '{enter}')
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.contains('button.tag-name', 'my tag').click({ force: true })
    })
    
    // Act
    cy.get('#completed-tasks-section button > svg.fa-ellipsis-vertical').click()
    cy.get('.dropdown-item').contains('Archive All').click()
    
    // Assert
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.contains('button.tag-name', 'my tag').click({ force: true })
    })
    cy.get('#completed-task-list .task').should('have.length', 1)
  })

  it('shows archived tasks in archive modal', () => {
    // Arrange
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    
    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()

    // Assert
    cy.get('#archive-dropdown').contains('Archived Tasks').should('be.visible')
    cy.get('#archive-dropdown').contains('My First Task').should('be.visible')
    cy.get('#archive-dropdown').contains('My Second Task').should('be.visible')
  })
})
