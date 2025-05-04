describe('24-hour clock', () => {
  it('displays non-24-hour clock by default', () => {
    // Assert
    cy.get('.navbar #time-container').contains(/ [AP]M/).should('be.visible')
  })

  it('toggles to 24-hour clock', () => {
    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').get('.dropdown-menu label').contains('Use 24-hour Clock').click()

    // Assert
    cy.get('.navbar #time-container').contains(/ [AP]M/).should('not.exist')
  })
})

describe('notifications', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.Notification = class MockNotification {
        constructor (title, options) {
          this.title = title
          this.options = options
        }

        close () {}
      }
      win.Notification.permission = 'default'
      win.Notification.requestPermission = cy.stub()
        .callsFake(async () => {
          win.Notification.permission = 'granted'
          return 'granted'
        })
        .as('requestPermissionStub')

      // Create spy on the constructor
      cy.spy(win, 'Notification').as('NotificationSpy')
      cy.spy(win.Notification.prototype, 'close').as('NotificationCloseSpy')
      cy.stub(win, 'alert').as('AlertStub')
    })

    cy.get('#incomplete-tasks-section input[placeholder="Enter new task.."]')
      .click()
      .type('My First Task{enter}')
  })

  it('should request notification permission when first task started', () => {
    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@requestPermissionStub').should('have.been.called')
    cy.get('@NotificationSpy').should('be.calledWith', 'Permissions to notify you have been granted!')
  })

  it('should alert user when permissions are denied', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.requestPermission = cy.stub().resolves('denied')
    })

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@AlertStub')
      .should('have.been.calledOnce')
      .and('have.been.calledWith', 'Warning! Permissions to notify you have been denied! You may not tell when your Pomodoro timer ends.')
  })

  it('should not request notification permission when already granted', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.permission = 'granted'
    })

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@requestPermissionStub').should('not.be.called')
    cy.get('@NotificationSpy').should('not.be.called')
  })

  it('should not request notification permission when already denied', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.permission = 'denied'
    })

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@requestPermissionStub').should('not.be.called')
    cy.get('@NotificationSpy').should('not.be.called')
  })

  it('show notification on timer complete', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.permission = 'granted'
    })
    cy.get('div').contains('25:00').click()
    cy.get('#countdown-container input[type="number"]:visible').clear().type('0.05{enter}')

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@NotificationSpy')
      .should('have.been.calledOnce')
      .and('have.been.calledWith', 'Finished Working, Take a Break!')
  })

  it('show alert on timer complete when notifications not enabled', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.requestPermission = cy.stub().resolves('denied')
    })
    cy.get('div').contains('25:00').click()
    cy.get('#countdown-container input[type="number"]:visible').clear().type('0.05{enter}')

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@AlertStub')
      .should('have.been.calledTwice')
      .and('have.been.calledWith', 'Warning! Permissions to notify you have been denied! You may not tell when your Pomodoro timer ends.')
      .and('have.been.calledWith', 'Finished Working, Take a Break!')
  })

  it('should display an alert when notifications not supported', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification = undefined
    })
    cy.get('div').contains('25:00').click()
    cy.get('#countdown-container input[type="number"]:visible').clear().type('0.05{enter}')

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('@AlertStub')
      .should('have.been.calledTwice')
      .and('have.been.calledWith', 'This browser does not support system notifications')
      .and('have.been.calledWith', 'Finished Working, Take a Break!')
  })

  it('shows notification setting disabled in options menu  by default', () => {
    // Assert
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').within(() => {
      cy.get('input[type="checkbox"]').should('not.be.checked')
    })
  })

  it('shows notification setting disabled in options menu  by default', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.permission = 'disabled'
    })

    // Act
    cy.get('button > svg.fa-play').click()

    // Assert
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').within(() => {
      cy.get('input[type="checkbox"]').should('not.be.checked')
    })
  })

  it('shows notification setting enabled in options menu when permissions granted', () => {
    // Arrange
    cy.get('button > svg.fa-play').click()
    cy.window().then((win) => {
      win.Notification.permission = 'granted'
    })

    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()

    // Assert
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').within(() => {
      cy.get('input[type="checkbox"]').should('be.checked')
    })
  })

  it('should allow user to enable notification permission via menu', () => {
    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').click()

    // Assert
    cy.get('@requestPermissionStub').should('have.been.called')
    cy.get('@NotificationSpy')
      .should('have.been.calledWith', 'Permissions to notify you have been granted!')
    cy.get('div').contains('25:00').click()
    cy.get('#countdown-container input[type="number"]:visible').clear().type('0.05{enter}')
    cy.get('button > svg.fa-play').click()
    cy.get('@NotificationSpy')
      .should('have.been.calledTwice')
      .and('have.been.calledWith', 'Permissions to notify you have been granted!')
      .and('have.been.calledWith', 'Finished Working, Take a Break!')
    cy.get('@NotificationCloseSpy').should('have.been.called')
  })

  it('when denying permission, checkbox should remain unchecked', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.requestPermission = cy.stub().resolves('denied')
    })

    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').click()

    // Assert
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').within(() => {
      cy.get('input[type="checkbox"]').should('not.be.checked')
    })
  })

  it('when enabling permissions but denied, should alert user', () => {
    // Arrange
    cy.window().then((win) => {
      win.Notification.permission = 'denied'
    })

    // Act
    cy.get('nav.navbar').get('a.nav-link').contains('Options').click()
    cy.get('nav.navbar').contains('.dropdown-menu .dropdown-item', 'Enable Notifications').click()

    // Assert
    cy.get('@AlertStub')
      .should('have.been.calledOnce')
      .and('have.been.calledWith', 'Notification permissions are denied. Go to your URL and enable notifications.')
  })
})
