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

        load_mailbox( 'sent' );
      } );


  } );

  // By default, load the inbox
  load_mailbox( 'inbox' );
} );

function compose_email ()
{

  // Show compose view and hide other views
  document.querySelector( '#emails-view' ).style.display = 'none';
  document.querySelector( '#compose-view' ).style.display = 'block';
  document.querySelector( '#single-email-container' ).style.display = 'none';

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
  document.querySelector( '#single-email-container' ).style.display = 'none';

  // Show the mailbox name
  document.querySelector( '#emails-view' ).innerHTML = `<h3>${ mailbox.charAt( 0 ).toUpperCase() + mailbox.slice( 1 ) }</h3>`;

  //as many mailbox I have
  fetch( `/emails/${ mailbox }` )
    .then( response => response.json() )
    .then( emails =>
    {
      emails.forEach( email =>
      {

        //destructuring
        const { sender, subject, timestamp, read, id } = email;

        //add classes
        const element = document.createElement( 'div' );
        element.classList.add( 'card-body', 'sent-div' );

        //format cards
        element.innerHTML = ` 
          <h5 class="card-title">${ sender }</h5>
          <h6 class="card-subtitle mb-2 text-muted">${ subject }</h6>
          <p class="card-text">${ timestamp }</p>
        `;

        // styles in other diff way
        element.style.border = '5px solid white';
        element.style.borderRadius = '15px';
        element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        element.style.marginBottom = '10px';

        //conditional background
        read ? element.style.backgroundColor = '#e9ecef' : element.style.backgroundColor = 'white';

        //checking if divs is clicked
        element.addEventListener( 'click', () =>
        {
          fetch( `/emails/${ id }` )
            .then( response => response.json() )
            .then( email =>
            {
              // Print email
              console.log( email );

              // ... do something else with email ...
              const { sender, recipients, subject, timestamp, body, archived } = email;

              document.querySelector( '#emails-view' ).style.display = 'none';
              document.querySelector( '#compose-view' ).style.display = 'none';
              document.querySelector( '#single-email-container' ).style.display = 'block';

              const singleEmailContainer = document.querySelector( '#single-email-container' );

              //create the archive button
              const archiveButton = document.createElement( 'button' );
              archiveButton.classList.add( 'btn', 'btn-outline-primary', 'mb-3' );
              archiveButton.textContent = !archived ? 'Archive' : 'Unarchive';
              archiveButton.addEventListener( 'click', () =>
              {
                //update archive status true/false false/true
                fetch( `/emails/${ id }`, {
                  method: 'PUT',
                  body: JSON.stringify( {
                    archived: !archived,
                  } )
                } )
                  .then( () => load_mailbox( 'inbox' ) );
              } );



              //create the reply button
              const replyButton = document.createElement( 'button' );
              replyButton.classList.add( 'btn', 'btn-outline-primary', 'mb-3' );
              replyButton.textContent = 'Reply';
              replyButton.addEventListener( 'click', () =>
              {
                //go to email composition
                compose_email();

                // Pre-filling with values from received email                
                document.querySelector( '#compose-recipients' ).value = `${ sender }`;

                const formatedSubject = subject.startsWith( 'Re:' ) ? `Re: ${ subject }` : `Re: ${ subject }`;
                document.querySelector( '#compose-subject' ).value = `${ formatedSubject }`;

                //place the cursor on the next paragraph with autofocus
                const composeBody = document.querySelector( '#compose-body' );
                composeBody.value = `On ${ timestamp } ${ sender } wrote: ${ body }\n\n`;
                composeBody.selectionStart = composeBody.selectionEnd = composeBody.value.length;
                composeBody.focus();

              } );

              // Update the innerHTML of the #single-email-container element
              singleEmailContainer.innerHTML = `
                <div class="card-body">
                  <div class="border-bottom mb-2">
                    <p class="card-title">From: ${ sender }</p>
                    <p class="card-subtitle mb-2 text-muted">To: ${ recipients }</p>
                    <p class="card-subtitle mb-2 text-muted">Subject: ${ subject }</p>
                    <p class="card-text">Timestamp: ${ timestamp }</p>
                  </div>
                  <p class="card-text">${ body }</p>
                </div>
              `;

              //add archive button to div with class border-bottom if not in sent mailbox
              mailbox !== 'sent' && singleEmailContainer.querySelector( '.card-body' ).append( archiveButton );

              console.log( recipients );

              //add reply button to div with class border-bottom in inbox for not replaying to onself
              singleEmailContainer.querySelector( '.border-bottom' ).append( replyButton );

              //update read status to false
              fetch( `/emails/${ id }`, {
                method: 'PUT',
                body: JSON.stringify( {
                  read: true
                } )
              } );
            } );
        } );
        //appending to the div
        document.querySelector( '#emails-view' ).append( element );
      } );
    } );

}
