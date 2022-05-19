import nav from './nav.js';

export default async(goTo) => {
  const responses = await Promise.all([
    fetch('/assets/svg/cancel.svg'),
    fetch('/assets/svg/close.svg')
  ]);
  const [cancel, close] =  await Promise.all(responses.map((response) => response.text()));
  const cancelTemplate = document.createElement('template');

  cancelTemplate.innerHTML = cancel;
  cancelTemplate.content.firstElementChild.classList.add('button__icon', 'button__icon_secondary');

  const closeTemplate = document.createElement('template');

  closeTemplate.innerHTML = close;
  closeTemplate.content.firstElementChild.classList.add('modal__close-icon');

  //1 (read)
  // Заменить на вызов API (получение данных)
  const response = await fetch('/api/players?status=all');
  const users = await response.json();
  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box container__content players">
        <div class="box__header">
          <h1 class="text text_title players__title">Список игроков</h1>
          <button class="button button_primary players__add-new">Добавить игрока</button>
        </div>
        <table class="players__table table">
          <tr class="table__row">
            <th class="text text_bold table__cell">Логин</th>
            <th class="text text_bold table__cell">Статус</th>
            <th class="text text_bold table__cell">Создан</th>
            <th class="text text_bold table__cell">Изменен</th>
            <th class="text text_bold table__cell"></th>
          </tr>
          ${
            users
              .map(
                ({id, login, status, createdAt, updatedAt}) =>
                  `
                    <tr class="table__cell">
                      <th class="text table__cell players__login">${login}</th>
                      <th class="text table__cell">
                        <div class="players__status players__status_${status}">
                          ${status === 'active' ? 'Активен' : 'Заблокирован'}
                        </div>
                      </th>
                      <th class="text table__cell">${new Date(createdAt).toDateString().slice(4)}</th>
                      <th class="text table__cell">${new Date(updatedAt).toDateString().slice(4)}</th>
                      <th class="text table__cell players__button">
                        <button
                          class="button button_secondary players__${status === 'active' ? 'block' : 'unblock'}"
                          data-id="${id}"
                        >
                          ${status === 'active' ? cancelTemplate.innerHTML : ''}
                          ${status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                        </button>
                      </th>
                    </tr>
                  `
              )
              .join('')
          }
        </table>
      </main>
    `;

  //2 (update) [done]
  for (const btnWrapper of template.content.querySelectorAll('.players__button')) {
    btnWrapper.firstElementChild.addEventListener(
      'click',
       (event) => {
        //Добавить вызов API (обновление, разблокирование пользователя)
        if (event.target.classList.contains('players__block')) { //блокировка пользователя

            fetch(`/api/players/${event.target.dataset.id}`,
              {
                method: 'DELETE',
                body: JSON.stringify({playerId: event.target.dataset.id, statusUser: 'deleted'}),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            console.log(`Вы заблокировали пользователя ${event.target.dataset.id}`);
            window.location.reload();

        } else { //разблокировка пользователя, обновление пароля
          fetch(`/api/players/${event.target.dataset.id}`,
            {
              method: 'PUT',
              body: JSON.stringify({playerId: event.target.dataset.id}),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            console.log(`Вы разблокировали пользователя ${event.target.dataset.id}`);
            window.location.reload();
        }

      }
    );
  }

  //3 (create) [done]
  template.content.querySelector('.players__add-new').addEventListener(
    'click',
    () => {
      const modalTemplate = document.createElement('template');

      modalTemplate.innerHTML =
        `
          <div class="modal">
            <div class="modal__window">
              <div class="modal__header">
                <button class="modal__close">${closeTemplate.innerHTML}</button>
              </div>
              <h1 class="text text_title modal__title">Добавьте игрока</h1>
              <form class="modal__content form players-create">
                <div class="input form__field">
                  <label class="text text_bold input__label" for="create-user-login-input">Логин</label>
                  <input
                    id="create-user-login-input"
                    type="text"
                    class="text input__textbox players-create__login"
                    placeholder="Логин"
                  >
                </div>
                <input type="submit" class="button button_primary modal__submit" value="Добавить">
              </form>
            </div>
          </div>
        `;

      const closeModal = (modal) => () => {
        document.body.removeChild(modal);
      };
      const closeThis = closeModal(modalTemplate.content.firstElementChild);

      modalTemplate.content.querySelector('.modal__close').addEventListener(
        'click',
        closeThis
      );
      modalTemplate.content.querySelector('.modal__submit').addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          const loginInput = document.querySelector('.players-create__login');

          if (!loginInput.value) {
            const errorMessage = 'Введите логин';

            if (!loginInput.nextElementSibling) {
              const messageElement = document.createElement('small');

              messageElement.innerHTML = errorMessage;
              messageElement.classList.add('input__error-message')
              loginInput.after(messageElement);
            } else {
              loginInput.nextElementSibling.innerHTML = errorMessage;
            }

            loginInput.classList.add('input__textbox_errored');

            return;
          } else {
            if (loginInput.nextElementSibling) {
              loginInput.nextElementSibling.remove();
            }

            loginInput.classList.remove('input__textbox_errored');
          }

          //Добавить вызов API (создание)
            fetch('/api/players',
              {
                method: 'POST',
                body: JSON.stringify({loginUser: loginInput.value}),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              window.location.reload();

          closeThis();
        }
      );

      document.body.append(modalTemplate.content.firstElementChild);
    }
  );

  template.content.prepend(await nav(goTo));
  template.content.querySelector('.nav__link[href="/players"]').classList.add('nav__link_active');

  return template.content;
};
