describe('create tasks', () => {
  beforeEach(() => {
    // Arrange
    cy.get('input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
  })

  it('archives an incomplete task', () => {
    // Act
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()

    // Assert
    cy.get('#selected-task-container #task-name').scrollIntoView()
    cy.get('#selected-task-container #task-name').contains('Archived My First Task').should('be.visible')
    cy.get('#incomplete-task-list').contains('My First Task').should('not.exist')
  })

  it('archives a complete task', () => {
    // Arrange
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()

    // Act
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()

    // Assert
    cy.get('#selected-task-container #task-name').scrollIntoView()
    cy.get('#selected-task-container #task-name').contains('Archived My First Task').should('be.visible')
    cy.get('#completed-task-list').contains('My First Task').should('not.exist')
  })

  it('unarchives a single task', () => {
    // Act
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    cy.get('button').contains('Unarchive').click()

    // Assert
    cy.get('#selected-task-container #task-name').contains('Archived').should('not.exist')
    cy.get('#incomplete-task-list').contains('My First Task').should('exist')
  })

  it('archives all completed tasks, hiding them from the list', () => {
    // Arrange
    cy.get('input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    
    // Act
    cy.get('#completed-tasks-section button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive All').click()
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
    cy.get('input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type('my tag' + '{enter}')
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter on:').within(() => {
      cy.contains('button', 'my tag').click()
    })
    
    // Act
    cy.get('#completed-tasks-section button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive All').click()
    
    // Assert
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filtering on tasks with:').within(() => {
      cy.get('button > svg.fa-xmark').click()
    })
    cy.get('#completed-task-list .task').should('have.length', 1)
  })

  it('shows archived tasks in archive modal', () => {
    // Arrange
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    cy.get('input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    
    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()

    // Assert
    cy.get('#archiveModal').contains('Archived Tasks').should('be.visible')
    cy.get('#archiveModal').contains('My First Task').should('be.visible')
    cy.get('#archiveModal').contains('My Second Task').should('be.visible')
  })

  it('allows unarchiving from archive modal', () => {
    // Arrange
    cy.get('#selected-task-container button > svg.fa-ellipsis-vertical').click()
    cy.get('button').contains('Archive').click()
    cy.get('nav.navbar').get('a.nav-link').contains('Archive').click()
    
    // Act
    cy.get('#archiveModal button').contains('Unarchive').click()

    // Assert
    cy.get('#archiveModal').contains('My First Task').should('not.exist')
    cy.get('#incomplete-task-list').contains('My First Task').should('be.visible')
  })
})
