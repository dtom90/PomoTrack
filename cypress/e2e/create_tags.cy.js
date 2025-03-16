describe('create tags', () => {
  const firstTagName = 'my first tag'
  const secondTagName = 'my second tag'

  beforeEach(() => {
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(firstTagName + '{enter}')
  })

  it('adds a tag to the first task', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    // (No specific action needed for this test)

    // Assert
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(firstTagName).should('be.visible')
    })
  })

  it('adds a tag to the first task after reload', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.reload()

    // Act
    cy.get('button > svg.fa-plus').click()
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')

    // Assert
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(secondTagName).should('be.visible')
    })
  })

  it('selects previous tag to the second task', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')
    cy.get('button > svg.fa-plus').click()
    cy.get('#tagInputDropdown .dropdown-menu button').contains(firstTagName).click()

    // Assert
    cy.get('#selected-task-container').within(() => {
      cy.get('#tagInputDropdown .dropdown-menu button').should('not.exist')
      cy.get('div.tag > button.tag-name').contains(firstTagName).should('be.visible')
    })
  })

  it('adds a second tag to the first task', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')

    // Assert
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(firstTagName)
      cy.get('div.tag > button.tag-name').contains(secondTagName)
    })
  })

  it('clicks the Tags button to show the Tags dropdown', () => {
    // Arrange
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')

    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Tags').click()

    // Assert
    cy.get('#navbarTagsDropdown').contains('Tags')
    cy.get('#navbarTagsDropdown').within(() => {
      cy.get('div.tag').eq(0).contains(firstTagName)
      cy.get('div.tag').eq(1).contains(secondTagName)
    })
  })

  it('clicks the Tag button to show the Tag Activity Modal', () => {
    // Act
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(firstTagName).click()
    })

    // Assert
    cy.get('#activityModal').contains(firstTagName).should('be.visible')
  })

  it('drags one task above the other in the Tags Menu', () => {
    // Arrange
    cy.get('input[placeholder="add new tag"]').should('have.focus').type(secondTagName + '{enter}')
    cy.get('nav.navbar').get('a.nav-link').contains('Tags').click()

    // Act
    cy.get('#navbarTagsDropdown').within(() => {
      cy.get('div.tag').contains(secondTagName)
        .closest('div.tag').drag('.drag-handle')
    })

    // Assert
    cy.get('div.tag').eq(0).contains(secondTagName)
    cy.get('div.tag').eq(1).contains(firstTagName)
  })

  it('creates a second task then filters on tag', () => {
    // Arrange
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')

    // Act
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.get('button.tag-name').contains(firstTagName).click({ force: true })
    })

    // Assert
    cy.get('#incomplete-task-list').contains('My First Task')
    cy.get('#incomplete-task-list').should('not.contain', 'My Second Task')
  })

  it('adds tag to new task when filtering on tag', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.get('button.tag-name').contains(firstTagName).click({ force: true })
    })

    // Act
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')

    // Assert
    cy.get('#incomplete-task-list').contains('My Second Task')
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(firstTagName).should('be.visible')
    })
  })

  it('removes then adds tag again, should have only one tag after reload', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.get('button.tag-name').contains(firstTagName).click({ force: true })
    })
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')

    // Act
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').click()
    cy.get('button > svg.fa-plus').click()
    cy.get('#tagInputDropdown .dropdown-menu button').contains(firstTagName).click({ force: true })
    cy.reload()

    // Assert
    cy.get('#incomplete-task-list').contains('My Second Task')
    cy.get('#selected-task-container').within(() => {
      cy.get('div.tag > button.tag-name').contains(firstTagName).should('be.visible')
    })
  })

  it('adds then removes tag from filter, new task should not have tag', () => {
    // Arrange
    cy.get('button > svg.fa-filter').click()
    cy.contains('.dropdown-menu:visible', 'Filter by Tag').within(() => {
      cy.get('button.tag-name').contains(firstTagName).click({ force: true })
      cy.get('button.tag-name').contains(firstTagName).click({ force: true })
    })

    // Act
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My Second Task{enter}')

    // Assert
    cy.get('#selected-task-container').within(() => {
      cy.get('#task-name').contains('My Second Task')
      cy.get('div.tag > button.tag-name').should('not.exist')
    })
  })
})
