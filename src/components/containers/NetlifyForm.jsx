import React from 'react';
import PropTypes from 'prop-types';

export default function NetlifyForm(props) {
  const { handleSubmit } = props;

  const submitHandler = (e) => {
    e.preventDefault();
    handleSubmit('db-form');
  };

  return (
    <p>You found me!</p>
  );

  /*
  return (
    <form name="db-form" method="post" onSubmit={submitHandler}>
      <input type="hidden" name="form-name" value="db-form" />
      <p>
        <label>
          Name:
          <input type="text" name="name" />
        </label>
      </p>
      <p>
        <button type="submit">Send</button>
      </p>
    </form>
  );
  */
}

NetlifyForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};
