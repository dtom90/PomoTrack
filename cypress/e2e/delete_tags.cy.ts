describe('delete tags', () => {
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

  it('removes the first tag', () => {
    // Arrange
    // (No specific arrangement needed for this test)

    // Act
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').click()

    // Assert
    cy.get('#task-tag-list').contains(firstTagName).should('not.exist')
  })

  it('removes the first tag of 2 tags, second remains', () => {
    // Arrange
    cy.get('input[placeholder="add new tag"]')
      .should('have.focus').type(secondTagName + '{enter}')

    // Act
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').first().click()

    // Assert
    cy.get('#selected-task-container #task-tag-list').contains(firstTagName).should('not.exist')
    cy.get('#selected-task-container #task-tag-list').contains(secondTagName).should('exist')
  })

  it('should keep tag removed on page reload', () => {
    // Arrange
    cy.get('#task-tag-list div.tag.btn-group button > svg.fa-xmark').click()

    // Act
    cy.reload()

    // Assert
    cy.get('#selected-task-container #task-tag-list').contains(firstTagName).should('not.exist')
  })

  it('deletes tag from all tasks', () => {
    // Arrange
    cy.get('.navbar-nav').get('.nav-item').contains('Tags').click()
    cy.get('#navbarTagsDropdown-menu').within(() => {
      cy.get('.tag').contains(firstTagName).click()

      // Act
      cy.contains('button', 'Delete').click()

      // Assert
      cy.get('.tag-button').should('not.exist')
    })
    cy.get('#selected-task-container #task-tag-list').contains(firstTagName).should('not.exist')
  })
})
