document.addEventListener( 'DOMContentLoaded', function ()
{

  // Use buttons to toggle between views
  document.querySelector( '#inbox' ).addEventListener( 'click', () => load_mailbox( 'inbox' ) );
  document.querySelector( '#sent' ).addEventListener( 'click', () => load_mailbox( 'sent' ) );
  document.querySelector( '#archived' ).addEventListener( 'click', () => load_mailbox( 'archive' ) );
  document.querySelector( '#compose' ).addEventListener( 'click', compose_email );

  //Submit new email form
  document.querySelector( '#compose-form' ).addEventListener( 'submit', ( e ) =>
  {
    e.preventDefault();

    const recipients = document.querySelector( '#compose-recipients' ).value;
    const subject = document.querySelector( '#compose-subject' ).value;
    const body = document.querySelector( '#compose-body' ).value;

    fetch( '/emails', {
      method: 'POST',
      body: JSON.stringify( {
        recipients,
        subject,
        body,
      } )
    } )
      .then( response => response.json() )
      .then( result =>
      {

        // Print result
        console.log( result );

      } );
    console.log( { recipients, subject, body } );

    load_mailbox( 'sent' );

  } );

  // By default, load the inbox
  load_mailbox( 'inbox' );
} );

function compose_email ()
{

  // Show compose view and hide other views
  document.querySelector( '#emails-view' ).style.display = 'none';
  document.querySelector( '#compose-view' ).style.display = 'block';

  // Clear out composition fields
  document.querySelector( '#compose-recipients' ).value = '';
  document.querySelector( '#compose-subject' ).value = '';
  document.querySelector( '#compose-body' ).value = '';
}
//it shows the menu and display whatever the text I placed
function load_mailbox ( mailbox )
{

  // Show the mailbox and hide other views
  document.querySelector( '#emails-view' ).style.display = 'block';
  document.querySelector( '#compose-view' ).style.display = 'none';

  // Show the mailbox name
  document.querySelector( '#emails-view' ).innerHTML = `<h3>${ mailbox.charAt( 0 ).toUpperCase() + mailbox.slice( 1 ) }</h3>`;

  //as many mailbox I have
  fetch( `/emails/${ mailbox }` )
    .then( response => response.json() )
    .then( emails =>
    {
      console.table( emails );

      emails.forEach( email =>
      {
        const { sender, subject, timestamp, read } = email;

        const element = document.createElement( 'div' );
        element.classList.add( 'card-body' );
        element.classList.add( 'sent-div' );

        element.innerHTML = ` 
          <h5 class="card-title">${ sender }</h5>
          <h6 class="card-subtitle mb-2 text-muted">${ subject }</h6>
          <p class="card-text">${ timestamp }</p>
        `;

        // styles
        element.style.border = '5px solid white';
        element.style.borderRadius = '15px';
        element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        element.style.marginBottom = '10px';

        email.read ? element.style.backgroundColor = '#e9ecef' : element.style.backgroundColor = 'white';

        element.addEventListener( 'click', () =>
        {
          console.log( 'This element has been clicked!', read );

        } );
        document.querySelector( '#emails-view' ).append( element );

      } );

    } );

}
