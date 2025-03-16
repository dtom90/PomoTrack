describe('filter tasks', () => {
  const firstTagName = 'tag a'
  const secondTagName = 'tag b'
  
  beforeEach(() => {
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(firstTagName + '{enter}')
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')
  })

  it('should filter on first tag', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })

    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 1)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 0)
  })

  it('should filter on second tag', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })

    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 0)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 1)
  })

  it('should remove filter to show all again', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })

    // Act
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })

    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 1)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 1)
  })

  it('should filter completed task list', () => {
    // Arrange
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()
    cy.get('#incomplete-task-list input[type="checkbox"][title="Mark task complete"]').first().click()

    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })

    // Assert
    cy.contains('#completed-task-list .task', 'My First Task').should('have.length', 1)
    cy.contains('#completed-task-list .task', 'My Second Task').should('have.length', 0)
  })
  
  it('should clear selected task if no task matches tag being filtered', () => {
    // Arrange
    cy.get('#selected-task-container button.tag-close > svg.fa-xmark').click()

    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })

    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 0)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 0)
    cy.get('#selected-task-container').should('not.contain.text')
  })
  
  it('should clear selected task if multiple filters selected with and clause', () => {
    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })
    
    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 0)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 0)
    cy.get('#selected-task-container').should('not.contain.text')
  })
  
  it('should update selected task on tag filter remove', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })
    
    // Act
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    
    // Assert
    cy.contains('#incomplete-task-list .task', 'My First Task').should('have.length', 0)
    cy.contains('#incomplete-task-list .task', 'My Second Task').should('have.length', 1)
    cy.get('#title-section').scrollIntoView()
    cy.get('#selected-task-container').contains('My Second Task').should('exist')
  })
  
  it('should continue timer even if selected task is cleared', () => {
    // Arrange
    cy.get('#selected-task-container button.tag-close > svg.fa-xmark').click()
    cy.get('button > svg.fa-play').click()
    
    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })
    
    // Assert
    cy.get('#active-task-container').should('be.visible')
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })
    cy.contains('#incomplete-task-list .task', 'My Second Task').click()
    cy.get('#timer-display').scrollIntoView()
    cy.get('#selected-task-container button > svg.fa-pause').should('be.visible')
    cy.get('#countdown-container').contains('24:58')
    cy.get('#countdown-container').contains('24:57')
  })
  
  it('should not add tag to new task when checkbox un-selected in filter menu', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    
    // Act
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('label', 'Include in new tasks').click({ force: true })
    })
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Third Task{enter}')
    
    // Assert
    cy.contains('#incomplete-task-list .task', 'My Third Task').should('have.length', 0)
  })
  
  it('should add tag to new task when checkbox selected (default) in filter menu', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    
    // Act
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Third Task{enter}')
    
    // Assert
    cy.contains('#incomplete-task-list .task', 'My Third Task').should('have.length', 1)
    cy.get('#selected-task-container').contains('My Third Task').should('exist')
    cy.get('#selected-task-container').contains(firstTagName).should('exist')
  })
  
  it('should not add new tag to already-created task when new filter selected', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', firstTagName).click({ force: true })
    })
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Third Task{enter}')
    
    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu', 'Filter by Tag').within(() => {
      cy.contains('button', secondTagName).click({ force: true })
    })
    
    // Assert
    cy.contains('#incomplete-task-list .task', 'My Third Task').should('have.length', 0)
  })
})
