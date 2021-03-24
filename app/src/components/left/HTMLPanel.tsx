import React, { useState, useCallback, useContext, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import StateContext from '../../context/context';
import HTMLItem from './HTMLItem';
import { makeStyles } from '@material-ui/core/styles';

/*
DESCRIPTION: This is the bottom half of the left panel, starting from the 'HTML
  Elements' header. The boxes containing each HTML element are rendered in
  HTMLItem, which itself is rendered by this component.

Central state contains all available HTML elements (stored in the HTMLTypes property).
  The data for HTMLTypes is stored in HTMLTypes.tsx and is added to central state in
  initialState.tsx.

Hook state:
  -tag: 
*/

const HTMLPanel = (props): JSX.Element => {
  const classes = useStyles();
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorStatus, setErrorStatus] = useState(false);
  const [state, dispatch] = useContext(StateContext);
  const {isThemeLight} = props;
  let startingID = 0;
  state.HTMLTypes.forEach(element => {
    if (element.id >= startingID) startingID = element.id;
  });
  startingID += 1;

  const [currentID, setCurrentID] = useState(startingID);

  const buttonClasses =
    'MuiButtonBase-root MuiButton-root MuiButton-text makeStyles-button-12 MuiButton-textPrimary';

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetError();
    setTag(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetError();
    setName(e.target.value);
  };

  const checkNameDupe = (inputName: String): boolean => {
    let checkList = state.HTMLTypes.slice();

    // checks to see if inputted comp name already exists
    let dupe = false;
    checkList.forEach(HTMLTag => {
      if (
        HTMLTag.name.toLowerCase() === inputName.toLowerCase() ||
        HTMLTag.tag.toLowerCase() === inputName.toLowerCase()
      ) {
        dupe = true;
      }
    });
    return dupe;
  };

  const triggerError = (type: String) => {
    setErrorStatus(true);
    if (type === 'empty') {
      setErrorMsg('* Input cannot be blank. *');
    } else if (type === 'dupe') {
      setErrorMsg('* Input already exists. *');
    } else if (type === 'letters') {
      setErrorMsg('* Input must start with a letter. *');
    } else if (type === 'symbolsDetected') {
      setErrorMsg('* Input must not contain symbols. *');
    } else if (type === 'length') {
      setErrorMsg('* Input cannot exceed 10 characters. *');
    }
  };

  const resetError = () => {
    setErrorStatus(false);
  };

  const createOption = (inputTag: String, inputName: String) => {
    // format name so first letter is capitalized and there are no whitespaces
    let inputNameClean = inputName.replace(/\s+/g, '');
    const formattedName =
      inputNameClean.charAt(0).toUpperCase() + inputNameClean.slice(1);
    // add new component to state
    const newElement = {
      id: currentID,
      tag: inputTag,
      name: formattedName,
      style: {},
      placeHolderShort: name,
      placeHolderLong: '',
      icon: null
    };
    dispatch({
      type: 'ADD ELEMENT',
      payload: newElement
    });
    setCurrentID(currentID + 1);
    setTag('');
    setName('');
  };

  const alphanumeric = (input: string): boolean => {
    let letterNumber = /^[0-9a-zA-Z]+$/;
    if (input.match(letterNumber)) return true;
    return false;
  };

  const handleSubmit = e => {
    e.preventDefault();
    let letters = /[a-zA-Z]/;
    if (!tag.charAt(0).match(letters) || !name.charAt(0).match(letters)) {
      triggerError('letters');
      return;
    } else if (!alphanumeric(tag) || !alphanumeric(name)) {
      triggerError('symbolsDetected');
      return;
    } else if (tag.trim() === '' || name.trim() === '') {
      triggerError('empty');
      return;
    } else if (checkNameDupe(tag) || checkNameDupe(name)) {
      triggerError('dupe');
      return;
    } else if (name.length > 10) {
      triggerError('length');
      return;
    }
    createOption(tag, name);
    resetError();
  };

  const handleDelete = (id: number): void => {
    dispatch({
      type: 'DELETE ELEMENT',
      payload: id
    });
  };

  const handleCreateElement = useCallback((e) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('submitButton').click();
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('keydown', handleCreateElement);
    return () => {
      document.removeEventListener('keydown', handleCreateElement)
    }
  }, []);


  // filter out separator so that it will not appear on the html panel
  const htmlTypesToRender = state.HTMLTypes.filter(type => type.name !== 'separator')
  return (
    <div className="HTMLItems">
      <div id="HTMLItemsTopHalf">
        <Grid
            id="HTMLItemsGrid"
          >
            {htmlTypesToRender.map(option => (
              <HTMLItem
                name={option.name}
                key={`html-${option.name}`}
                id={option.id}
                Icon={option.icon}
                handleDelete={handleDelete}
                isThemeLight={isThemeLight}
              />
            ))}
          </Grid>
      </div>
      <div className="lineDiv">
        <hr
          style={{
            borderColor: isThemeLight ? '#f5f5f5' : '#186BB4',
            borderStyle: 'solid',
            height: '0.5px',
            width: '100%',
            marginLeft: '0px'
          }}
        />
      </div>
      <div className={classes.addComponentWrapper}>
        <div className={classes.inputWrapper}>
          <form onSubmit={handleSubmit} className="customForm">

            <h5 className={isThemeLight ? classes.lightThemeFontColor : classes.darkThemeFontColor }>New HTML Tag: </h5>
            <label className={isThemeLight ? `${classes.inputLabel} ${classes.lightThemeFontColor}` : `${classes.inputLabel} ${classes.darkThemeFontColor}`}>
              Tag:
            </label>
              <input
                color={'primary'}
                type="text"
                name="Tag"
                value={tag}
                autoComplete="off"
                onChange={handleTagChange}
                className={isThemeLight ? `${classes.input} ${classes.lightThemeFontColor}` : `${classes.input} ${classes.darkThemeFontColor}`}
                style={{ marginBottom: '10px' }}
              />
              
              {(!tag.charAt(0).match(/[A-Za-z]/) || !alphanumeric(tag) || tag.trim() === '' || checkNameDupe(tag))
               && <span className={isThemeLight ? `${classes.errorMessage} ${classes.errorMessageLight}` : `${classes.errorMessage} ${classes.errorMessageDark}`}>
                                <em>{errorMsg}</em>
                              </span>}
              
            <br></br>
            <label className={isThemeLight ? `${classes.inputLabel} ${classes.lightThemeFontColor}` : `${classes.inputLabel} ${classes.darkThemeFontColor}`}>
              Element Name:
            </label>
            <input
              color={'primary'}
              type="text"
              name="Tag Name"
              value={name}
              onChange={handleNameChange}
              autoComplete="off"
              className={isThemeLight ? `${classes.input} ${classes.lightThemeFontColor}` : `${classes.input} ${classes.darkThemeFontColor}`}
            />

            {(!name.charAt(0).match(/[A-Za-z]/) || !alphanumeric(name) || name.trim() === '' || name.length > 10 || checkNameDupe(name))
              && <span className={isThemeLight ? `${classes.errorMessage} ${classes.errorMessageLight}` : `${classes.errorMessage} ${classes.errorMessageDark}`}>
                              <em>{errorMsg}</em>
                            </span>}           
            <input

              className={isThemeLight ? `${classes.addElementButton} ${classes.lightThemeFontColor}` : `${classes.addElementButton} ${classes.darkThemeFontColor}`}
              id="submitButton"
              type="submit"
              value="Add Element"
              
            />
          </form>
        </div>
      </div>
        
    </div>
  );
};

const useStyles = makeStyles({
  inputWrapper: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    width: '100%'
  },
  addComponentWrapper: {
    width: '100%',
    margin: '5px 0px 0px 0px'
  },
  input: {
    borderRadius: '5px',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: 'rgba(255,255,255,0.15)',
    margin: '0px 0px 0px 10px',
    width: '140px',
    height: '30px',
  },
  inputLabel: {
    fontSize: '85%',
    zIndex: 20,
    margin: '-10px 0px -10px 0px',
    width: '125%'
  },
  addElementButton: {
    backgroundColor: 'transparent',
    height: '40px',
    width: '105px',
    fontFamily: '"Raleway", sans-serif',
    fontSize: '85%',
    textAlign: 'center',
    marginLeft: '75px',
    borderStyle: 'none',
    transition: '0.3s',
    borderRadius: '25px',
  },
  lightThemeFontColor: {
    color: '#186BB4'
  },
  darkThemeFontColor: {
    color: '#ffffff'
  },
  errorMessage: {
    fontSize:"11px", 
    marginTop: "10px",
    width: "150px",
    marginLeft: "-15px"
  },
  errorMessageLight: {
    color: '#6B6B6B'
  },
  errorMessageDark: {
    color: 'white'
  }
});

export default HTMLPanel;
