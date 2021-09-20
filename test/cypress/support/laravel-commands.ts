declare namespace Cypress {
  interface Chainable {
    refreshDatabase (options?: Record<string, any>): any

    seed (seederClass: string[] | string): any

    csrfToken (): any

    artisan (command: string, parameters?: Record<string, any>, options?: Record<string, any>): any
  }
}

function webUrl (url: string) {
  return `${Cypress.env('web_url')}${url}`
}

Cypress.Commands.add('artisan', (command, parameters = {}, options = {}) => {
  options = Object.assign({}, { log: true }, options)

  if (options.log) {
    Cypress.log({
      name: 'artisan',
      message: command,
      consoleProps: () => ({ command, parameters }),
    })
  }

  return cy.csrfToken().then((token: string) => {
    return cy.request({
      method: 'POST',
      url: webUrl('/__cypress__/artisan'),
      body: { command: command, parameters: parameters, _token: token },
      log: false,
      headers: {
        'Accept': 'application/json'
      }
    }).should((server) => {
      Cypress.log({
        name: 'Shit'
      })
    })
  })
})

Cypress.Commands.add('csrfToken', () => {
  return cy
    .request({
      method: 'GET',
      url: webUrl('/__cypress__/csrf_token'),
      log: false,
    })
    .its('body', { log: false })
})

/**
 * Refresh the database state.
 *
 * @param {Object} options
 *
 * @example cy.refreshDatabase();
 *          cy.refreshDatabase({ '--drop-views': true });
 */
Cypress.Commands.add('refreshDatabase', (options: Record<string, any> = {}) => {
  return cy.artisan('migrate:fresh', options);
});

Cypress.Commands.add('seed', (seederClass: string[] | string) => {
  if (typeof seederClass === 'string') {
    return cy.artisan(`db:seed --class=${seederClass}`)
  }

  return seederClass.reduce((prev, current) => prev.artisan(`db:seed --class=${current}`), cy)

})

