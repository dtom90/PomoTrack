describe('interval updates', () => {
  beforeEach(() => {
    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
  })

  describe('interval creation', () => {
    it('should display start and end times in manual interval panel', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('.activity-view img[alt="Add interval"]').click()

      // Assert
      cy.get('#add-interval-dropdown-menu').within(() => {
        cy.get('.b-form-group').contains('Started:')
        cy.get('.b-form-group').contains('Duration:')
        cy.get('.b-form-group').contains('Stopped:')
      })
    })

    it('should manually add an interval', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Assert
      cy.get('tr').last().within(() => {
        cy.get('td').contains('Time Spent: 25 minutes')
      })
    })

    it('should add an interval when hitting enter', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view .b-form-group').contains('Duration:').within(() => {
        cy.get('input').type('{enter}')
      })

      // Assert
      cy.get('tr').last().within(() => {
        cy.get('td').contains('Time Spent: 25 minutes')
      })
    })

    it('should not alter timer after adding interval', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Assert
      cy.get('#countdown-container button > svg.fa-play').should('exist')
    })

    it('should keep running interval at top when manually adding during running interval', () => {
      // Arrange
      cy.get('#countdown-container button > svg.fa-play').click()
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Assert
      cy.get('.activity-view tr').first().within(() => {
        cy.get('td').contains('Running')
      })
      cy.get('.activity-view tr').last().within(() => {
        cy.get('td').contains('Stopped')
      })
    })

    it('should add an interval then create a new task. new task log should be blank', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view .b-form-group').contains('Duration:').within(() => {
        cy.get('input').type('{enter}')
      })

      // Act
      cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
        .click()
        .type('My Second Task{enter}')

      // Assert
      cy.get('#task-log').within(() => {
        cy.contains('Time Spent:').should('not.exist')
      })
    })

  })

  describe('interval updates', () => {
    it('should manually update an interval with enter button', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Act
      cy.get('tr').last().within(() => {
        cy.get('button > svg.fa-ellipsis-vertical').click()
        cy.get('#add-interval-dropdown-menu .b-form-group').contains('Duration:').within(() => {
          cy.get('input').clear().type('35{enter}')
        })
      })

      // Assert
      cy.get('tr').last().within(() => {
        cy.get('td').contains('Time Spent: 35 minutes')
      })
    })

    it('should manually update an interval with click', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Act
      cy.get('tr').last().within(() => {
        cy.get('button > svg.fa-ellipsis-vertical').click()
        cy.get('.b-form-group').contains('Duration:').within(() => {
          cy.get('input').clear().type('35')
        })
        cy.get('.btn').contains('Update Interval').click()
      })

      // Assert
      cy.get('tr').last().within(() => {
        cy.get('td').contains('Time Spent: 35 minutes')
      })
    })

    it('should not allow updating an active interval', () => {
      // Arrange
      cy.get('#countdown-container button > svg.fa-play').click()
      cy.wait(500)
      cy.contains('Activity Log').scrollIntoView()

      cy.get('tr').last().within(() => {
        // Act
        cy.get('button > svg.fa-ellipsis-vertical').click()

        // Assert
        cy.get('#add-interval-dropdown-menu').within(() => {
          cy.contains('Stop Timer to Update Interval').should('be.visible')
          cy.contains('button', 'Delete Interval').should('not.exist')
        })
      })
    })
  })

  describe('interval deletion', () => {
    it('should manually delete an interval', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()

      // Act
      cy.get('tr').last().within(() => {
        cy.get('button > svg.fa-ellipsis-vertical').click()
        cy.get('.btn-danger').contains('Delete Interval').click()
      })

      // Assert
      cy.get('.activity-view tr').should('not.exist')
    })

    it('should manually delete an interval after page reload', () => {
      // Arrange
      cy.contains('Activity Log').scrollIntoView()
      cy.get('.activity-view img[alt="Add interval"]').click()
      cy.get('.activity-view button').contains('Add Interval').click()
      cy.reload()
      cy.contains('Activity Log').scrollIntoView()

      // Act
      cy.get('tr').last().within(() => {
        cy.get('button > svg.fa-ellipsis-vertical').click()
        cy.get('.btn-danger').contains('Delete Interval').click()
      })

      // Assert
      cy.get('.activity-view tr').should('not.exist')
    })
  })
})
