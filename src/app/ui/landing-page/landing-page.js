let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')

let css = csjs`
  .sectionContainer {
    display         : flex;
    flex-direction  : column;
    flex-wrap       : wrap;
    align-content   : space-around;
    padding         : 20px;
    max-width       : 300px;
    min-height      : 200px;
    background-color: var(--light);
    font-family     : "Lucida Console", Monaco, monospace;
  }
  .landingPage {
    height          : 100%;
    width           : 100%;
    flex-wrap       : wrap;
    justify-content : space-evenly;
    user-select     : none;
  }
  .im {
    display         : grid;
    max-width       : 200px;
    max-height      : 200px;
    width           : 100%;
    height          : 100%;
    padding         : 20px;
    background-color: var(--bg-light);
    align-self      : center;
  }
  .im:hover {
  }
  .getStarted {
    margin-top      : 50px;
    width           : 100%;
    font-size       : xx-large;
    align-self      : center;

  }
  .text {
    cursor: pointer;
    font-weight: normal;
    max-width: 300px;
    user-select: none;
  }
  .text:hover {
    font-weight: bold;
  }
}
`

import { defaultWorkspaces } from './workspace'
import { ApiFactory } from 'remix-plugin'
import Section from './section'

export class LandingPage extends ApiFactory {

  constructor (appManager, appStore) {
    super()
    this.sections = []
    let load = function (item) {
      let compilerImport = new CompilerImport()
      let fileProviders = globalRegistry.get('fileproviders').api
      modalDialogCustom.prompt(null, 'Enter the ' + item + ' you would like to load.', null, (target) => {
        if (target !== '') {
          compilerImport.import(
            target,
            (loadingMsg) => { tooltip(loadingMsg) },
            (error, content, cleanUrl, type, url) => {
              if (error) {
                modalDialogCustom.alert(error)
              } else {
                if (fileProviders[type]) {
                  fileProviders[type].addReadOnly(cleanUrl, content, url)
                }
              }
            }
          )
        }
      })
    }
    let fileExplorer = globalRegistry.get('fileexplorer/browser').api
    var actionsStart = [
      { label: 'New file',
        type: 'callback',
        payload: () => {
          fileExplorer.createNewFile()
        }
      },
      {
        // Open a file
        label: yo`
          <label class="${css.text} m-0 h6 text-dark">
            Open file
            <input title="open file" type="file" onchange="${
              (event) => {
                event.stopPropagation()
                fileExplorer.uploadFile(event)
              }
            }" multiple />
          </label>
        `,
        type: `callback`,
        description: ``,
        payload: () => {}
      },
      { label: 'Import from Gist',
        type: `callback`,
        description: ``,
        payload: () => {
          let app = globalRegistry.get('app').api
          app.loadFromGist({gist: ''})
        }
      },
      { label: 'Import from GitHub',
        type: `callback`,
        description: ``,
        payload: () => {
          load('URL')
        }
      },
      { label: 'Import from Swarm',
        type: `callback`,
        description: ``,
        payload: () => { load('bzz-raw URL') }
      },
      { label: 'Import from IPFS',
        type: `callback`,
        description: ``,
        payload: () => { load('IPFS URL') }
      },
      { label: 'Connect to localhost',
        type: `callback`,
        description: ``,
        payload: () => {
          appManager.ensureActivated('remixd')
        }
      }
    ]

    var actionsResources = [
      { label: 'Remix documentation', type: `link`, description: ``, payload: `https://remix.readthedocs.io/en/latest/#` },
      { label: 'Medium posts', type: `link`, description: ``, payload: `https://medium.com/remix-ide` },
      { label: 'Gitter channel', type: `link`, description: ``, payload: `https://gitter.im/ethereum/remix` }
    ]

    var sectionStart = new Section('Start', actionsStart)
    let sectionResources = new Section('Resources', actionsResources)

    this.sectionWorkspaceMain = []
    // this.sectionWorkspaceOthers = []
    defaultWorkspaces(appManager).forEach((workspace) => {
      if (workspace.isMain) {
        this.sectionWorkspaceMain.push({
          label: workspace.title,
          type: 'callback',
          description: workspace.description,
          payload: () => { workspace.activate() }
        })
      } else {
        /* this.sectionWorkspaceOthers.push({
          label: workspace.title,
          type: 'callback',
          description: workspace.description,
          payload: () => { workspace.activate() }
        }) */
      }
    })

    this.sections.push(sectionStart)
    this.sections.push(sectionResources)
  }

  get profile () {
    return {
      displayName: 'Home',
      name: 'home',
      methods: [],
      events: [],
      description: ' - ',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9IiAgIE0yNSwxQzExLjc0NSwxLDEsMTEuNzQ1LDEsMjVzMTAuNzQ1LDI0LDI0LDI0czI0LTEwLjc0NSwyNC0yNFMzOC4yNTUsMSwyNSwxTDI1LDF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PHBhdGggZD0iICBNNDAuNjk2LDYuODMyYzAsMC0xMy4xNjksOC4yMTItMTEuNTMyLDIyLjMzMmMxLjE0Miw5Ljg1OCwxMS45MzUsMTMuMzc3LDExLjkzNSwxMy4zNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNNy4zODUsOC45MTNjMCwwLDMuMDQxLDYuNDc2LDMuMDQxLDE4LjE2OWMwLDkuMjQ2LTMuNTgzLDEyLjkxMS0zLjU4MywxMi45MTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNMS44NTIsMjIuOTMyYzAsMCw2LjQ5Myw2LjIzMiwyMy4xNDgsNi4yMzJzMjMuNDM4LTYuMjQ2LDIzLjQzOC02LjI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyLjA1ODMiLz48cGF0aCBkPSIgIE0yNS42NDgsMS41NDhjMCwwLTYuODk1LDcuOTM1LTYuODk1LDIzLjQ1MkMxOC43NTQsNDAuNTE4LDI1LDQ4LjYyNSwyNSw0OC42MjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PC9zdmc+',
      location: 'mainPanel'
    }
  }

  render () {
    let logo = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODUzYzAuODExLDAuNTcxLDEuMjE4LDEuMzQsMS4yMTgsMi4zMTQNCgkJYzAsMi4yNzctMS4wNTksMy40OTYtMy4xNjgsMy42NTZjLTUuMDM4LDAuODE0LTkuMzgxLDIuMzU2LTEzLjAzNyw0LjYzYy0zLjY1NSwyLjI3Ni02LjY2Myw1LjExNy05LjAxNiw4LjUyOA0KCQljLTIuMzU3LDMuNDExLTQuMTA0LDcuMjcyLTUuMjM5LDExLjU3NWMtMS4xMzksNC4zMDctMS43MDYsOC44MTQtMS43MDYsMTMuNTI0djMyLjY1M2MwLDIuMjczLTEuMTM5LDMuNDExLTMuNDEyLDMuNDExDQoJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIzYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzMsMCwzLjQxMiwxLjEzOCwzLjQxMiwzLjQxMXYxNS4xMDgNCgkJYzEuNDYyLTIuNDM3LDMuMjA2LTQuNzUyLDUuMjM5LTYuOTQ1YzIuMDI5LTIuMTkzLDQuMjY0LTQuMTQzLDYuNzAxLTUuODQ4YzIuNDM3LTEuNzA2LDUuMDc2LTMuMDg1LDcuOTE5LTQuMTQzDQoJCUM2NC43NzEsNDI5LjQzMyw2Ny42NTgsNDI4LjkwNCw3MC41ODIsNDI4LjkwNHoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMTM3Ljc3Myw0MjcuMTk4YzUuNjg1LDAsMTAuOTY2LDEuMTgxLDE1LjgzOSwzLjUzNGM0Ljg3NCwyLjM1Niw5LjA1NSw1LjQ4MiwxMi41NSw5LjM4MQ0KCQljMy40OTIsMy44OTksNi4yMTQsOC40MDcsOC4xNjQsMTMuNTI0YzEuOTQ5LDUuMTE3LDIuOTI0LDEwLjQ0LDIuOTI0LDE1Ljk2MWMwLDAuOTc2LTAuMzY2LDEuNzktMS4wOTcsMi40MzgNCgkJYy0wLjczMSwwLjY1LTEuNTgzLDAuOTc1LTIuNTU5LDAuOTc1aC02Ny45ODdjMC40ODcsNC4yMjYsMS41ODQsOC4yODUsMy4yOSwxMi4xODRjMS43MDYsMy44OTksMy45MzcsNy4zMTIsNi43MDEsMTAuMjM0DQoJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCWMwLjY0Ny0xLjEzNiwxLjYyMi0xLjcwNiwyLjkyNC0xLjcwNmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDEyYzAsMC4xNjMtMC4xNjQsMC43My0wLjQ4NywxLjcwNQ0KCQljLTMuNDEyLDYuMDEzLTguMjA1LDEwLjQ3OS0xNC4zNzcsMTMuNDAyYy02LjE3NiwyLjkyNC0xMi42NzEsNC4zODctMTkuNDk1LDQuMzg3Yy01LjY4OSwwLTEwLjkyOC0xLjE4MS0xNS43MTgtMy41MzMNCgkJYy00Ljc5My0yLjM1NC04LjkzNi01LjQ4My0xMi40MjgtOS4zODJjLTMuNDk1LTMuODk5LTYuMjE0LTguNDA3LTguMTYzLTEzLjUyNGMtMS45NS01LjExOC0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCWMwLTUuNTIxLDAuOTc1LTEwLjg0NCwyLjkyNC0xNS45NjFjMS45NDktNS4xMTcsNC42NjgtOS42MjUsOC4xNjMtMTMuNTI0YzMuNDkyLTMuODk4LDcuNjM0LTcuMDI0LDEyLjQyOC05LjM4MQ0KCQlDMTI2Ljg0Niw0MjguMzc5LDEzMi4wODQsNDI3LjE5OCwxMzcuNzczLDQyNy4xOTh6IE0xNjkuOTQsNDY2LjE4OGMtMC4zMjgtNC4yMjMtMS4zNDEtOC4yODUtMy4wNDYtMTIuMTg0DQoJCWMtMS43MDYtMy44OTktMy45ODItNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5MS03LjA2N2MtMy44MTktMS43ODUtNy45Mi0yLjY4LTEyLjMwNi0yLjY4DQoJCWMtNC41NSwwLTguNjkyLDAuODk1LTEyLjQyOCwyLjY4Yy0zLjczOSwxLjc5LTYuOTg3LDQuMTQ0LTkuNzQ4LDcuMDY3Yy0yLjc2NCwyLjkyNC00Ljk5NSw2LjMzNi02LjcwMSwxMC4yMzUNCgkJYy0xLjcwNiwzLjg5OC0yLjgwMiw3Ljk2MS0zLjI5LDEyLjE4NEgxNjkuOTR6Ii8+DQoJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTMwNC42OSw0MjcuNDQxYzUuMDM0LDAsOS41MDQsMS4wMTgsMTMuNDAyLDMuMDQ3YzMuODk5LDIuMDMzLDcuMTg5LDQuNjcyLDkuODcsNy45Mg0KCQljMi42OCwzLjI1MSw0LjcwOSw3LjA2Niw2LjA5MiwxMS40NTJjMS4zNzksNC4zODcsMi4wNyw4Ljg1NiwyLjA3LDEzLjQwMnY0My42MmMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk3LDIuNDM4DQoJCWMtMC43MywwLjY0Ni0xLjUwMywwLjk3NS0yLjMxMywwLjk3NWMtMi4yNzYsMC0zLjQxMi0xLjE0LTMuNDEyLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTI5LTcuMTA0LTEuNTg0LTEwLjYNCgkJYy0xLjA1OS0zLjQ5MS0yLjYwMi02LjYxOC00LjYzLTkuMzgyYy0yLjAzMy0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4OC0xLjYyMS02LjY2Mi0yLjQzNi0xMC43MjItMi40MzYNCgkJYy01LjIsMC05LjU4NywxLjIxOC0xMy4xNTksMy42NTRjLTMuNTc0LDIuNDM4LTYuNDU3LDUuNTY2LTguNjUsOS4zODJjLTIuMTkzLDMuODE5LTMuODE4LDguMDQyLTQuODc0LDEyLjY3Mg0KCQljLTEuMDU5LDQuNjMtMS41ODQsOS4wNTgtMS41ODQsMTMuMjh2MzMuNjI5YzAsMC45NzUtMC4zNjUsMS43ODktMS4wOTYsMi40MzhjLTAuNzMxLDAuNjQ2LTEuNTA1LDAuOTc1LTIuMzE1LDAuOTc1DQoJCWMtMi4yNzYsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTMtNy4xMDQtMS41ODUtMTAuNmMtMS4wNTgtMy40OTEtMi42MDEtNi42MTgtNC42MjktOS4zODINCgkJYy0yLjAzNC0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4Ny0xLjYyMS02LjY2My0yLjQzNi0xMC43MjItMi40MzZjLTUuMDM3LDAtOS4zNDQsMC44OTUtMTIuOTE1LDIuNjgNCgkJYy0zLjU3NSwxLjc5LTYuNTQyLDQuMjY2LTguODk1LDcuNDMzYy0yLjM1NywzLjE2Ny00LjA2Myw2Ljk0NC01LjExNywxMS4zMzFjLTEuMDU5LDQuMzg2LTEuNTg0LDkuMS0xLjU4NCwxNC4xMzR2My44OTl2MC4yNDMNCgkJdjMyLjg5N2MwLDIuMjcyLTEuMTM4LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjczLDEuMTM1LTMuNDExLDMuNDExLTMuNDExDQoJCWMyLjI3MywwLDMuNDEyLDEuMTM4LDMuNDEyLDMuNDExdjEyLjQyOGMyLjkyNC01LjE5Nyw2Ljg2MS05LjM4MiwxMS44MTktMTIuNTVjNC45NTQtMy4xNjcsMTAuNTE3LTQuNzUyLDE2LjY5Mi00Ljc1Mg0KCQljNi45ODMsMCwxMi45OTUsMS45OTEsMTguMDMyLDUuOTdjNS4wMzMsMy45ODMsOC42ODgsOS4yMjMsMTAuOTY2LDE1LjcxOWMyLjc2LTYuMzM2LDYuNzM5LTExLjUzMywxMS45NC0xNS41OTYNCgkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMzc4Ljc1Myw0MjkuMzkyYzAuODExLDAsMS41ODQsMC4zNjUsMi4zMTQsMS4wOTdjMC43MzEsMC43MywxLjA5NywxLjUwNCwxLjA5NywyLjMxNHY3NC4wOA0KCQljMCwwLjgxNC0wLjM2NSwxLjU4NC0xLjA5NywyLjMxNWMtMC43MywwLjczLTEuNTA0LDEuMDk3LTIuMzE0LDEuMDk3Yy0wLjk3NSwwLTEuNzktMC4zNjYtMi40MzgtMS4wOTcNCgkJYy0wLjY1LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzE0QzM3Ni45NjMsNDI5Ljc1NywzNzcuNzc4LDQyOS4zOTIsMzc4Ljc1Myw0MjkuMzkyeiINCgkJLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNNDczLjM0LDQyOC42NmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDExbC0wLjQ4NywxLjk1bC0yNC4zNjgsMzUuMzM0bDI0LjM2OCwzNS41NzcNCgkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3Mi0xLjEzOSwzLjQxMi0zLjQxMiwzLjQxMmMtMS4zMDIsMC0yLjE5My0wLjQ4OC0yLjY4LTEuNDYzbC0yMi45MDYtMzMuMzg0DQoJCWwtMjIuNjYzLDMzLjM4NGMtMC44MTQsMC45NzUtMS43OSwxLjQ2My0yLjkyNCwxLjQ2M2MtMi4yNzcsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEyYzAtMC4zMjQsMC4xNTktMC45NzUsMC40ODYtMS45NQ0KCQlsMjQuMzY5LTM1LjU3N2wtMjQuMzY5LTM1LjMzNGwtMC40ODYtMS45NWMwLTIuMjcyLDEuMTM0LTMuNDExLDMuNDExLTMuNDExYzEuMTM0LDAsMi4xMDksMC40ODcsMi45MjQsMS40NjJsMjIuNjYzLDMzLjE0MQ0KCQlsMjIuOTA2LTMzLjE0MUM0NzEuMTQ2LDQyOS4xNDcsNDcyLjAzOCw0MjguNjYsNDczLjM0LDQyOC42NnoiLz4NCjwvZz4NCjxnPg0KCTxnPg0KCQk8ZyBvcGFjaXR5PSIwLjQ1Ij4NCgkJCTxnPg0KCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMTUwLjczNCwxOTYuMjEyIDI1NS45NjksMzQ0LjUwOCAyNTUuOTY5LDI1OC4zODcgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuOCI+DQoJCQk8Zz4NCgkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI1NS45NjksMjU4LjM4NyAyNTUuOTY5LDM0NC41MDggMzYxLjI2NywxOTYuMjEyIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDEyNi43ODEgMTUwLjczMywxNzQuNjExIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIxNTAuNzM0LDE3NC42MTIgMjU1Ljk2OSwyMzYuODE4IDI1NS45NjksMTI2Ljc4MiAyNTUuOTY5LDAuMDAxIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjgiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDAgMjU1Ljk2OSwxMjYuNzgxIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo='
    let totalLook = yo`
      <div class="border-left ${css.landingPage}">
      </div>
    `

    let main = yo`<div class="container"></div>`
    for (let i = 0; i < this.sectionWorkspaceMain.length; i++) {
      main.appendChild(yo`
        <span class="btn btn-secondary btn-lg m-2" style=" font-size: x-large;" onclick="${this.sectionWorkspaceMain[i].payload}">
          ${this.sectionWorkspaceMain[i].label}
        </span>
      `)
    }

     /* let others = yo`<div class="container m-4"></div>`
    for (let i = 0; i < this.sectionWorkspaceOthers.length; i++) {
      others.appendChild(yo`
        <span class="btn btn-secondary btn-sm m-2" onclick="${this.sectionWorkspaceOthers[i].payload}">
          ${this.sectionWorkspaceOthers[i].label}
        </span>
      `)
    } */

    let docs = yo`<div class="container m-5"></div>`
    for (let i = 0; i < this.sections.length; i++) {
      docs.appendChild(yo`
        <div class="${css.sectionContainer} p-2">
          ${this.sections[i].render()}
        </div>
      `)
    }

    totalLook.appendChild(yo`
      <div class="container-fluid">
        <div class="row" style="flex-wrap: nowrap;">
          <div class="column m-5" style="min-width: 50%;">
            <div class="card p-4">
              <img class="card-img-top ${css.im}" src="${logo}" />
              <div class="card-body-fluid">
                <h5 class="card-header m-4">Workspaces</h5>
                <p>${main}</p>
              </div>
            </div>
            <div>
              <span class="btn btn-secondary ${css.getStarted}" onclick=${() => { tooltip('  not implemented yet :P   ') }}>Get Started</span>
             </div>
          </div>
          <div>
            ${docs}
          </div>
        </div>
      </div>
    `)

    return totalLook
  }
}
