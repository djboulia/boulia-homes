import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

const getButtonId = function(target) {
  const parent = target.parentNode;
  console.log(parent);
  return parseInt(parent.id);
}

export default function MultiToggleButton(props) {

  const id = props.id;
  const disabled = props.disabled;
  const labels = props.labels;
  const onChange = props.onChange;

  const [selected, setSelected] = React.useState(props.selected);

  const buttonClick = function (event) {
    const buttonId = getButtonId(event.target);

    // you can click on button groups such that the click lands
    // in between buttons.  when that happens, we don't get a 
    // valid button id on the click.  ignore those clicks here
    if (!isNaN(buttonId)) {
      setSelected(buttonId);

      if (onChange) {
        onChange({ id: id, selected: buttonId });
      }  
    }
  }

  return (
    <ButtonGroup size={'small'}>
      {labels.map((label, index) => (
        <Button
          disabled={disabled}
          key={index}
          id={index}
          variant={selected === index ? 'contained' : undefined}
          color={selected === index ? 'primary' : undefined}
          onClick={buttonClick}>
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
