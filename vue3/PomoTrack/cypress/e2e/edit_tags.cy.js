describe('edit tags', () => {
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

  it('should show tag in Tags menu', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Assert
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      cy.get('.tag').contains(firstTagName)
    })
    cy.get('.btn-group > button.tag-name').contains(firstTagName)
  })

  it('should show tag in Tags menu even if removed from task', () => {
    // Arrange
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').click()

    // Act
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Assert
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      cy.get('.tag').contains(firstTagName)
    })
  })

  it('should show tag in Tags menu even if removed from task after refresh', () => {
    // Arrange
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').click()

    // Act
    cy.reload()

    // Assert
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      cy.get('.tag').contains(firstTagName)
    })
  })

  it('should edit the tag name', () => {
    // Arrange
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Act
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      cy.get('.tag').contains(firstTagName).click()
      cy.get('.dropdown-menu input[title="Rename tag"]').type(' updated')
      cy.get('.dropdown-menu').contains('button', 'Confirm').click()
    })

    // Assert
    cy.get('.btn-group > button.tag-name').contains(firstTagName + ' updated')
  })

  it('should reorder tags', () => {
    // Arrange
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      // Act
      cy.get('.tag').contains(secondTagName).parents('.dropdown-item').find('.drag-handle')
        .drag('.drag-handle', { destination: 'li' })

      // Assert
      cy.get('.btn-group > button.tag-name').first().contains(secondTagName)
      cy.get('.btn-group > button.tag-name').last().contains(firstTagName)
    })
  })

  it('should reorder tags on task', () => {
    // Arrange
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Act
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      // const firstElement = cy.get('.tag').contains(firstTagName).parents('.tag').find('.drag-handle')
      cy.get('.tag').contains(secondTagName).parents('.dropdown-item').find('.drag-handle')
        .drag('.drag-handle', { destination: '.tag' })
    })

    // Assert
    cy.get('#selected-task-container .btn-group > button.tag-name').first().contains(secondTagName)
    cy.get('#selected-task-container .btn-group > button.tag-name').last().contains(firstTagName)
  })

  it('should reorder 3 tags', () => {
    // Arrange
    const thirdTagName = 'my third tag'
    cy.get('input[placeholder="add new tag"]').should('have.focus').type(secondTagName + '{enter}')
    cy.get('input[placeholder="add new tag"]').should('have.focus').type(thirdTagName + '{enter}')
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Act
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      // const firstElement = cy.get('.tag').contains(firstTagName).parents('.tag').find('.drag-handle')
      cy.get('.tag').contains(secondTagName).parents('.dropdown-item').find('.drag-handle')
        .drag('.drag-handle', { destination: '.tag' })

      // Assert
      cy.get('.tag').should('have.length', 3)
      cy.get('.tag').first().contains(secondTagName)
      cy.get('.tag').last().contains(thirdTagName)
    })
  })

  it('should reorder 3 tags after closing and re-opening', () => {
    // Arrange
    const thirdTagName = 'my third tag'
    cy.get('input[placeholder="add new tag"]').should('have.focus').type(secondTagName + '{enter}')
    cy.get('input[placeholder="add new tag"]').should('have.focus').type(thirdTagName + '{enter}')
    cy.get('.navbar-nav').get('a.nav-link').contains('Tags').click()

    // Act
    cy.contains('#navbarTagsDropdown', 'Tags').within(() => {
      cy.get('.tag').contains(secondTagName).parents('.dropdown-item').find('.drag-handle')
        .drag('.drag-handle', { destination: '.tag' })

      // Assert
      cy.get('.tag').should('have.length', 3)
      cy.get('.tag').first().contains(secondTagName)
      cy.get('.tag').last().contains(thirdTagName)
    })
  })
})
